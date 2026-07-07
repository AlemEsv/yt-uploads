import React, { useState } from "react";
import { BackendProvider, useBackend } from "./context/BackendContext.jsx";
import { WebSocketProvider } from "./context/WebSocketContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import { LibraryProvider } from "./context/LibraryContext.jsx";
import { PlayerProvider } from "./context/PlayerContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import ToastContainer from "./components/common/ToastContainer.jsx";
import Sidebar from "./components/layout/Sidebar.jsx";
import CapturePanel from "./components/layout/CapturePanel.jsx";
import PlayerBar from "./components/player/PlayerBar.jsx";
import LibraryPage from "./pages/LibraryPage.jsx";
import FavoritesPage from "./pages/FavoritesPage.jsx";
import ProfilesPage from "./pages/ProfilesPage.jsx";
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
  library: LibraryPage,
  favorites: FavoritesPage,
  profiles: ProfilesPage,
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

function MainShell() {
  const [activeView, setActiveView] = useState("library");
  const [legalAccepted, setLegalAccepted] = useState(
    () => localStorage.getItem(LEGAL_ACCEPTED_KEY) === "true",
  );
  const ActivePage = PAGES[activeView] ?? LibraryPage;

  if (!legalAccepted) {
    return (
      <OnboardingLegalPage
        mode="onboarding"
        onAccept={() => {
          localStorage.setItem(LEGAL_ACCEPTED_KEY, "true");
          setLegalAccepted(true);
        }}
      />
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        <Sidebar activeView={activeView} onSelectView={setActiveView} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <CapturePanel />
          <div style={{ flex: 1, overflow: "auto" }}>
            <ActivePage />
          </div>
        </div>
      </div>
      <PlayerBar />
      <ToastContainer />
    </div>
  );
}

function AppShell() {
  const { status } = useBackend();

  if (status !== "ready") {
    return <BackendStatusScreen />;
  }

  return (
    <WebSocketProvider>
      <ToastProvider>
        <ThemeProvider>
          <LibraryProvider>
            <PlayerProvider>
              <MainShell />
            </PlayerProvider>
          </LibraryProvider>
        </ThemeProvider>
      </ToastProvider>
    </WebSocketProvider>
  );
}

export default function App() {
  return (
    <BackendProvider>
      <AppShell />
    </BackendProvider>
  );
}
