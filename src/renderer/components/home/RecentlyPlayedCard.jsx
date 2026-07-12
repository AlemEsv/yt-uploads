import React from "react";
import { usePlayer } from "../../context/PlayerContext.jsx";
import { useApi } from "../../hooks/useApi.js";

export default function RecentlyPlayedCard({ song }) {
  const api = useApi();
  const { playNow } = usePlayer();

  return (
    <button
      type="button"
      onClick={() => playNow(song.id)}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        width: "165px",
        flexShrink: 0,
        border: "none",
        background: "transparent",
        cursor: "pointer",
        textAlign: "left",
        padding: 0,
        font: "inherit",
      }}
    >
      {api && (
        <img
          src={api.coverUrl(song.id, song.fecha_modificacion)}
          alt=""
          style={{
            width: "165px",
            height: "165px",
            borderRadius: "9px",
            objectFit: "cover",
            background: "#161616",
          }}
        />
      )}
      <div
        style={{
          fontWeight: 700,
          fontSize: "1.1rem",
          color: "var(--color-text-primary)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {song.titulo}
      </div>
      <div
        style={{
          fontWeight: 600,
          fontSize: "1rem",
          color: "var(--color-inactive-text)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {song.artista ?? "Artista desconocido"}
      </div>
    </button>
  );
}
