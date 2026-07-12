import React, { useState } from "react";
import { Play, Heart, MoreHorizontal } from "lucide-react";
import { usePlayer } from "../../context/PlayerContext.jsx";
import { useLibrary } from "../../context/LibraryContext.jsx";
import { useApi } from "../../hooks/useApi.js";
import { formatTime } from "../../utils/formatTime.js";
import TrackRowMenu from "./TrackRowMenu.jsx";

export default function TrackRow({ rank, song, onEdit, columns = [] }) {
  const api = useApi();
  const { playNow } = usePlayer();
  const { toggleFavorite } = useLibrary();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex items-center gap-4 px-5 py-3 hover:bg-white/5 transition-colors cursor-pointer group rounded-[8px]">
      {rank != null && (
        <>
          <span className="w-5 text-center text-[13px] text-[#9b9b9b] group-hover:hidden shrink-0">
            {rank}
          </span>
          <button
            type="button"
            onClick={() => playNow(song.id)}
            className="w-5 hidden group-hover:flex items-center justify-center shrink-0 bg-transparent border-none cursor-pointer p-0"
          >
            <Play size={13} className="text-white fill-white" />
          </button>
        </>
      )}

      {api && (
        <img
          src={api.coverUrl(song.id, song.fecha_modificacion)}
          alt=""
          onClick={() => playNow(song.id)}
          className="w-[44px] h-[44px] rounded-[4px] object-cover shrink-0 bg-[#161616]"
        />
      )}

      <div className="flex-1 min-w-0" onClick={() => playNow(song.id)}>
        <p className="text-[14px] font-semibold truncate group-hover:text-[var(--color-accent)] transition-colors m-0">
          {song.titulo}
        </p>
        <p className="text-[12px] text-[#b2b2b2] truncate m-0">
          {song.artista ?? "Unknown artist"}
        </p>
      </div>

      {columns.map((col) => (
        <span key={col.key} className={col.className}>
          {col.render(song)}
        </span>
      ))}

      <p
        className="w-10 text-right text-[13px] text-[#9b9b9b] shrink-0 m-0"
        style={{ fontFamily: "var(--font-secondary)" }}
      >
        {formatTime(song.duracion_segundos)}
      </p>

      <div className="w-14 flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button
          type="button"
          onClick={() => toggleFavorite(song)}
          className="bg-transparent border-none cursor-pointer p-0"
          title={song.es_favorito ? "Liked" : "Like"}
        >
          <Heart
            size={13}
            className={
              song.es_favorito ? "text-[#f21c2c] fill-[#f21c2c]" : "text-white/50 hover:text-white"
            }
          />
        </button>
        <div className="relative flex items-center">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="bg-transparent border-none cursor-pointer p-0"
            title="More"
          >
            <MoreHorizontal size={13} className="text-white/50 hover:text-white" />
          </button>
          {menuOpen && (
            <TrackRowMenu song={song} onEdit={onEdit} onClose={() => setMenuOpen(false)} />
          )}
        </div>
      </div>
    </div>
  );
}
