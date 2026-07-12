import React, { useState } from "react";
import {
  BookOpen,
  Calendar,
  Clock,
  Disc3,
  HardDrive,
  Heart,
  Home,
  ListMusic,
  Plus,
} from "lucide-react";
import { usePlaylists } from "../../context/PlaylistsContext.jsx";

const navDiscover = [
  { id: "home", label: "Home", icon: Home },
  { id: "genres", label: "Genres", icon: Disc3 },
  { id: "albums", label: "Albums", icon: BookOpen },
  { id: "events", label: "Events", icon: Calendar },
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
          ? "text-white bg-white/10"
          : "text-white/70 hover:text-white hover:bg-white/5 bg-transparent"
      }`}
    >
      <Icon size={15} />
      {item.label}
    </button>
  );
}

function CreatePlaylistModal({ onClose, onCreate }) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleCreate(event) {
    event.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onCreate(name.trim());
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[2000]">
      <form
        onSubmit={handleCreate}
        className="popover-in bg-[#131212] border border-white/10 rounded-[12px] p-6 w-[320px] flex flex-col gap-3"
      >
        <h2 className="m-0 text-[16px] font-bold">New playlist</h2>
        <input
          autoFocus
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Playlist name"
          className="w-full px-3 py-2 rounded-[6px] border border-white/10 bg-[#0c0c0c] text-white text-[13px] outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
        />
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-[8px] border border-white/10 bg-transparent text-white text-[13px] cursor-pointer hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!name.trim() || saving}
            className={`px-4 py-1.5 rounded-[8px] border-none bg-[var(--color-accent)] text-white text-[13px] font-semibold transition-opacity ${
              name.trim() && !saving
                ? "cursor-pointer hover:opacity-90"
                : "opacity-50 cursor-not-allowed"
            }`}
          >
            Create
          </button>
        </div>
      </form>
    </div>
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
    <aside className="w-[254px] shrink-0 bg-[#080808] rounded-[15px] flex flex-col py-6 px-5 overflow-y-auto">
      <p className="text-[11px] font-semibold tracking-widest text-white mb-2 mt-0">DISCOVER</p>
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

      <p className="text-[11px] font-semibold tracking-widest text-white mb-2 mt-0">LIBRARY</p>
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

      <p className="text-[11px] font-semibold tracking-widest text-white mb-2 mt-0">
        YOUR PLAYLIST
      </p>
      <button
        type="button"
        onClick={() => setShowCreate(true)}
        className="flex items-center gap-2 px-2 py-1.5 text-[14px] transition-colors border-none cursor-pointer text-left bg-transparent text-[#9b9b9b] hover:text-white"
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
              ? "text-white"
              : "text-[#9b9b9b] hover:text-white"
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
