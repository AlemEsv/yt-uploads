import React, { useState } from "react";
import {
  BarChart3,
  BookOpen,
  Clock,
  Disc3,
  HardDrive,
  Heart,
  Home,
  ListMusic,
  Plus,
} from "lucide-react";
import { usePlaylists } from "../../context/PlaylistsContext.jsx";
import CreatePlaylistModal from "../playlists/CreatePlaylistModal.jsx";

const navDiscover = [
  { id: "home", label: "Home", icon: Home },
  { id: "genres", label: "Genres", icon: Disc3 },
  { id: "albums", label: "Albums", icon: BookOpen },
  { id: "stats", label: "Statistics", icon: BarChart3 },
];

const navLibrary = [
  { id: "recent", label: "Recent", icon: Clock },
  { id: "favorites", label: "Liked songs", icon: Heart },
  { id: "library", label: "Local", icon: HardDrive },
];

function NavRow({ item, active, onSelect }) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      className={`flex items-center gap-3 px-2 py-1.5 rounded-[8px] text-[14px] font-semibold transition-colors border-none cursor-pointer text-left w-full ${
        active
          ? "text-[var(--color-text-primary)] bg-[var(--color-overlay-hover)]"
          : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-overlay-subtle)] bg-transparent"
      }`}
    >
      <Icon size={15} />
      {item.label}
    </button>
  );
}

export default function Sidebar({ activeView, onSelectView, activePlaylistId, onOpenPlaylist }) {
  const { playlists, createPlaylist } = usePlaylists();
  const [showCreate, setShowCreate] = useState(false);

  async function handleCreate(name) {
    const playlist = await createPlaylist(name);
    if (playlist) {
      onOpenPlaylist(playlist.id);
    }
  }

  return (
    <aside className="w-[254px] shrink-0 glass rounded-[15px] flex flex-col py-6 px-5 overflow-y-auto">
      <p className="text-[11px] font-semibold tracking-widest text-[var(--color-text-primary)] mb-2 mt-0">
        DISCOVER
      </p>
      <nav className="flex flex-col gap-1 mb-6">
        {navDiscover.map((item) => (
          <NavRow
            key={item.id}
            item={item}
            active={activeView === item.id}
            onSelect={onSelectView}
          />
        ))}
      </nav>

      <p className="text-[11px] font-semibold tracking-widest text-[var(--color-text-primary)] mb-2 mt-0">
        LIBRARY
      </p>
      <nav className="flex flex-col gap-1 mb-6">
        {navLibrary.map((item) => (
          <NavRow
            key={item.id}
            item={item}
            active={activeView === item.id}
            onSelect={onSelectView}
          />
        ))}
      </nav>

      <p className="text-[11px] font-semibold tracking-widest text-[var(--color-text-primary)] mb-2 mt-0">
        YOUR PLAYLIST
      </p>
      <button
        type="button"
        onClick={() => setShowCreate(true)}
        className="flex items-center gap-2 px-2 py-1.5 text-[14px] transition-colors border-none cursor-pointer text-left bg-transparent text-[var(--color-muted-text)] hover:text-[var(--color-text-primary)]"
      >
        <Plus size={14} />
        Create playlist
      </button>
      {playlists.map((playlist) => (
        <button
          key={playlist.id}
          type="button"
          onClick={() => onOpenPlaylist(playlist.id)}
          className={`flex items-center gap-2 px-2 py-1.5 text-[14px] transition-colors border-none cursor-pointer text-left bg-transparent ${
            activeView === "playlists" && playlist.id === activePlaylistId
              ? "text-[var(--color-text-primary)]"
              : "text-[var(--color-muted-text)] hover:text-[var(--color-text-primary)]"
          }`}
        >
          <ListMusic size={14} />
          <span className="truncate">{playlist.nombre}</span>
        </button>
      ))}

      {showCreate && (
        <CreatePlaylistModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />
      )}
    </aside>
  );
}
