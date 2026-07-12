import React from "react";
import { Music, Search } from "lucide-react";
import { useLibrary } from "../../context/LibraryContext.jsx";
import DownloadTrigger from "./DownloadTrigger.jsx";
import UserMenu from "./UserMenu.jsx";

export default function TopBar({ activeView, onSelectView }) {
  const { searchQuery, setSearchQuery } = useLibrary();

  function handleSearchChange(value) {
    setSearchQuery(value);
    if (value && activeView !== "library" && activeView !== "favorites") {
      onSelectView("library");
    }
  }

  return (
    <header className="flex items-center gap-4 px-6 py-3 shrink-0 z-10">
      <div className="flex items-center gap-2 w-[254px] shrink-0">
        <Music size={18} className="text-white" />
        <span className="font-bold text-[18px] tracking-tight">SoundDock</span>
      </div>

      <div className="flex-1 max-w-[600px]">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#696969]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => handleSearchChange(event.target.value)}
            placeholder="Artists, songs, or albums"
            className="w-full bg-[#f1f1f1] text-black placeholder:text-[#696969] placeholder:italic placeholder:text-[12px] rounded-[6px] h-[34px] pl-8 pr-4 text-[13px] outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <DownloadTrigger />
        <UserMenu activeView={activeView} onSelectView={onSelectView} />
      </div>
    </header>
  );
}
