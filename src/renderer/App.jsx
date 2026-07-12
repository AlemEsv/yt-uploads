import React, { useState } from "react";
import { BackendProvider, useBackend } from "./context/BackendContext.jsx";
import { AppearanceProvider } from "./context/AppearanceContext.jsx";
import { WebSocketProvider } from "./context/WebSocketContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import { LibraryProvider } from "./context/LibraryContext.jsx";
import { PlayerProvider, usePlayer } from "./context/PlayerContext.jsx";
import { PlaylistsProvider, usePlaylists } from "./context/PlaylistsContext.jsx";
import ToastContainer from "./components/common/ToastContainer.jsx";
import CursorGlow from "./components/common/CursorGlow.jsx";
import TitleBar from "./components/layout/TitleBar.jsx";
import TopBar from "./components/layout/TopBar.jsx";
import Sidebar from "./components/layout/Sidebar.jsx";
import CapturePanel from "./components/layout/CapturePanel.jsx";
import PlayerBar from "./components/player/PlayerBar.jsx";
import CreatePlaylistModal from "./components/playlists/CreatePlaylistModal.jsx";
import HomePage from "./pages/HomePage.jsx";
import LibraryPage from "./pages/LibraryPage.jsx";
import FavoritesPage from "./pages/FavoritesPage.jsx";
import RecentPage from "./pages/RecentPage.jsx";
import GenresPage from "./pages/GenresPage.jsx";
import AlbumsPage from "./pages/AlbumsPage.jsx";
import PlaylistsPage from "./pages/PlaylistsPage.jsx";
import StatsPage from "./pages/StatsPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import OnboardingLegalPage from "./pages/OnboardingLegalPage.jsx";

const LEGAL_ACCEPTED_KEY = "sounddock:legalAccepted";

const STATUS_LABEL = {
  starting: "Iniciando el motor local...",
  ready: "Backend: ready",
  crashed: "Se perdió la conexión con el motor local. Reintentando...",
  restarting: "Reiniciando el motor local...",
};

const PAGES = {
  home: HomePage,
  library: LibraryPage,
  favorites: FavoritesPage,
  recent: RecentPage,
  genres: GenresPage,
  albums: AlbumsPage,
  playlists: PlaylistsPage,
  stats: StatsPage,
  settings: SettingsPage,
};

function BackendStatusScreen() {
  const { status } = useBackend();
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        gap: "0.5rem",
      }}
    >
      <h1 style={{ fontSize: "1.25rem", fontWeight: 600 }}>SoundDock</h1>
      <p style={{ color: "var(--color-text-secondary)" }}>{STATUS_LABEL[status] ?? status}</p>
    </div>
  );
}

function MainShell({ activeView, onSelectView, activePlaylistId, onOpenPlaylist }) {
  const ActivePage = PAGES[activeView] ?? HomePage;

  return (
    <div className="flex flex-col h-full text-[var(--color-text-primary)] overflow-hidden relative">
      <TopBar activeView={activeView} onSelectView={onSelectView} />
      <CapturePanel />
      <div className="flex flex-1 gap-4 px-4 pb-4 min-h-0">
        <Sidebar
          activeView={activeView}
          onSelectView={onSelectView}
          activePlaylistId={activePlaylistId}
          onOpenPlaylist={onOpenPlaylist}
        />
        <main
          key={`${activeView}-${activeView === "playlists" ? activePlaylistId : ""}`}
          className="page-in flex-1 rounded-[15px] overflow-y-auto min-h-0 bg-[var(--color-surface-raised)]"
        >
          <ActivePage
            onSelectView={onSelectView}
            activePlaylistId={activePlaylistId}
            onOpenPlaylist={onOpenPlaylist}
          />
        </main>
      </div>
      <PlayerBar />
      <ToastContainer />
    </div>
  );
}

function AppContent() {
  const { status } = useBackend();
  const { createPlaylist } = usePlaylists();
  const { showQueue, toggleQueue } = usePlayer();
  const [activeView, setActiveView] = useState("home");
  const [activePlaylistId, setActivePlaylistId] = useState(null);
  const [legalAccepted, setLegalAccepted] = useState(
    () => localStorage.getItem(LEGAL_ACCEPTED_KEY) === "true",
  );
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  function openPlaylist(playlistId) {
    setActivePlaylistId(playlistId);
    setActiveView("playlists");
  }

  async function handleCreatePlaylist(name) {
    const playlist = await createPlaylist(name);
    if (playlist) openPlaylist(playlist.id);
  }

  let body;
  if (status !== "ready") {
    body = <BackendStatusScreen />;
  } else if (!legalAccepted) {
    body = (
      <OnboardingLegalPage
        mode="onboarding"
        onAccept={() => {
          localStorage.setItem(LEGAL_ACCEPTED_KEY, "true");
          setLegalAccepted(true);
        }}
      />
    );
  } else {
    body = (
      <MainShell
        activeView={activeView}
        onSelectView={setActiveView}
        activePlaylistId={activePlaylistId}
        onOpenPlaylist={openPlaylist}
      />
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <CursorGlow />
      <TitleBar
        onSelectView={setActiveView}
        onNewPlaylist={() => setShowCreatePlaylist(true)}
        onToggleQueue={toggleQueue}
        showQueue={showQueue}
        onShowAbout={() => setShowAbout(true)}
      />
      <div style={{ flex: 1, minHeight: 0 }}>{body}</div>

      {showCreatePlaylist && (
        <CreatePlaylistModal
          onClose={() => setShowCreatePlaylist(false)}
          onCreate={handleCreatePlaylist}
        />
      )}
      {showAbout && <OnboardingLegalPage mode="about" onClose={() => setShowAbout(false)} />}
    </div>
  );
}

function AppShell() {
  return (
    <WebSocketProvider>
      <ToastProvider>
        <LibraryProvider>
          <PlaylistsProvider>
            <PlayerProvider>
              <AppContent />
            </PlayerProvider>
          </PlaylistsProvider>
        </LibraryProvider>
      </ToastProvider>
    </WebSocketProvider>
  );
}

export default function App() {
  return (
    <BackendProvider>
      <AppearanceProvider>
        <AppShell />
      </AppearanceProvider>
    </BackendProvider>
  );
}
