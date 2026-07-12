import React from "react";
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
import { useTheme } from "../../context/ThemeContext.jsx";

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

export default function Sidebar({ activeView, onSelectView }) {
  const { profiles, activeProfileId, activateProfile } = useTheme();

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
        onClick={() => onSelectView("playlists")}
        className={`flex items-center gap-2 px-2 py-1.5 text-[14px] transition-colors border-none cursor-pointer text-left bg-transparent ${
          activeView === "playlists" ? "text-white" : "text-[#9b9b9b] hover:text-white"
        }`}
      >
        <Plus size={14} />
        Create playlist
      </button>
      {profiles.map((profile) => (
        <button
          key={profile.id}
          type="button"
          onClick={() => activateProfile(profile.id)}
          title={`Activate ${profile.nombre}`}
          className={`flex items-center gap-2 px-2 py-1.5 text-[14px] transition-colors border-none cursor-pointer text-left bg-transparent ${
            profile.id === activeProfileId ? "text-white" : "text-[#9b9b9b] hover:text-white"
          }`}
        >
          <ListMusic size={14} style={{ color: profile.paleta_colores?.accent }} />
          <span className="truncate">{profile.nombre}</span>
        </button>
      ))}
    </aside>
  );
}
