import React, { useState } from "react";
import { Play, Heart, MoreHorizontal } from "lucide-react";
import { usePlayer } from "../../context/PlayerContext.jsx";
import { useLibrary } from "../../context/LibraryContext.jsx";
import { formatTime } from "../../utils/formatTime.js";
import SongCover from "../common/SongCover.jsx";
import TrackRowMenu from "./TrackRowMenu.jsx";

export default function TrackRow({ rank, song, onEdit, columns = [] }) {
  const { playNow } = usePlayer();
  const { toggleFavorite } = useLibrary();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="group relative flex items-center gap-4 px-4 py-2.5 rounded-[8px] hover:bg-[var(--color-overlay-subtle)] transition-colors select-none">
      {rank != null && (
        <>
          <span className="w-5 text-[14px] font-bold text-[var(--color-text-secondary)] group-hover:hidden shrink-0 text-center">
            {rank}
          </span>
          <button
            type="button"
            onClick={() => playNow(song.id)}
            className="w-5 hidden group-hover:flex items-center justify-center shrink-0 bg-transparent border-none cursor-pointer p-0"
          >
            <Play
              size={13}
              className="text-[var(--color-text-primary)] fill-[var(--color-text-primary)]"
            />
          </button>
        </>
      )}

      <SongCover
        song={song}
        onClick={() => playNow(song.id)}
        className="w-[44px] h-[44px] rounded-[4px] cursor-pointer"
        iconSize={18}
      />

      <div className="flex-1 min-w-0" onClick={() => playNow(song.id)}>
        <p className="text-[14px] font-semibold truncate group-hover:text-[var(--color-accent)] transition-colors m-0">
          {song.titulo}
        </p>
        <p className="text-[12px] text-[var(--color-text-secondary)] truncate m-0">
          {song.artista ?? "Unknown artist"}
        </p>
      </div>

      {columns.map((col) => (
        <span key={col.key} className={col.className}>
          {col.render(song)}
        </span>
      ))}

      <p
        className="w-10 text-right text-[13px] text-[var(--color-muted-text)] shrink-0 m-0"
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
              song.es_favorito
                ? "text-[var(--color-heart)] fill-[var(--color-heart)]"
                : "text-[var(--color-muted-text)] hover:text-[var(--color-text-primary)]"
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
            <MoreHorizontal
              size={13}
              className="text-[var(--color-muted-text)] hover:text-[var(--color-text-primary)]"
            />
          </button>
          {menuOpen && (
            <TrackRowMenu song={song} onEdit={onEdit} onClose={() => setMenuOpen(false)} />
          )}
        </div>
      </div>
    </div>
  );
}
