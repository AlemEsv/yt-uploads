import React from "react";
import { ListMusic } from "lucide-react";

export default function PlaylistsPage() {
  return (
    <div className="bg-black min-h-full p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[28px] font-bold m-0">Playlists</h1>
      </div>

      <div className="bg-[#080808] rounded-[15px] flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="w-14 h-14 rounded-full bg-[var(--color-accent-soft)] flex items-center justify-center mb-4">
          <ListMusic size={24} className="text-[var(--color-accent)]" />
        </div>
        <h2 className="text-[18px] font-bold m-0">Coming soon</h2>
        <p className="text-[13px] text-[#9b9b9b] mt-2 mb-0 max-w-[360px]">
          You will be able to create your own playlists by grouping songs from your library.
        </p>
      </div>
    </div>
  );
}
