import React, { useState } from "react";
import { Heart, MoreVertical, Play } from "lucide-react";
import { usePlayer } from "../../context/PlayerContext.jsx";
import { useLibrary } from "../../context/LibraryContext.jsx";
import { useApi } from "../../hooks/useApi.js";
import { formatTime } from "../../utils/formatTime.js";
import TrackRowMenu from "./TrackRowMenu.jsx";

export default function RankedTrackRow({ rank, song, onEdit }) {
  const api = useApi();
  const { playNow } = usePlayer();
  const { toggleFavorite } = useLibrary();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        padding: "0.5rem 0.75rem",
        borderRadius: "8px",
      }}
    >
      <div
        style={{
          width: "28px",
          flexShrink: 0,
          textAlign: "center",
          fontWeight: 700,
          fontSize: rank && Number.isFinite(rank) ? "1.1rem" : "0.7rem",
          color:
            rank && Number.isFinite(rank)
              ? "var(--color-text-primary)"
              : "var(--color-text-secondary)",
        }}
      >
        {rank}
      </div>

      {api && (
        <img
          src={api.coverUrl(song.id, song.fecha_modificacion)}
          alt=""
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "3px",
            objectFit: "cover",
            background: "#161616",
            flexShrink: 0,
          }}
        />
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontWeight: 600,
            fontSize: "0.9rem",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {song.titulo}
        </div>
        <div
          style={{
            fontSize: "0.8rem",
            color: "var(--color-text-secondary)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {song.artista ?? "Artista desconocido"}
        </div>
      </div>

      <div style={{ position: "relative", flexShrink: 0 }}>
        <button type="button" onClick={() => setMenuOpen((v) => !v)} style={iconButtonStyle(false)}>
          <MoreVertical size={17} strokeWidth={2.25} />
        </button>
        {menuOpen && (
          <TrackRowMenu song={song} onEdit={onEdit} onClose={() => setMenuOpen(false)} />
        )}
      </div>

      <button
        type="button"
        onClick={() => toggleFavorite(song)}
        style={iconButtonStyle(song.es_favorito)}
      >
        <Heart
          size={17}
          strokeWidth={2.25}
          fill={song.es_favorito ? "var(--color-heart)" : "none"}
        />
      </button>

      <span
        style={{
          width: "40px",
          textAlign: "right",
          fontFamily: "var(--font-secondary)",
          fontSize: "0.75rem",
          color: "var(--color-text-primary)",
          flexShrink: 0,
        }}
      >
        {formatTime(song.duracion_segundos)}
      </span>

      <button type="button" onClick={() => playNow(song.id)} style={iconButtonStyle(false)}>
        <Play size={17} strokeWidth={2.25} />
      </button>
    </div>
  );
}

function iconButtonStyle(active) {
  return {
    width: "30px",
    height: "30px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    borderRadius: "50%",
    background: "transparent",
    color: active ? "var(--color-heart)" : "var(--color-text-primary)",
    cursor: "pointer",
    flexShrink: 0,
  };
}
