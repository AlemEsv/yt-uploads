import React, { useState } from "react";
import { usePlayer } from "../../context/PlayerContext.jsx";
import { useLibrary } from "../../context/LibraryContext.jsx";
import { useApi } from "../../hooks/useApi.js";
import { useDominantColor } from "../../hooks/useDominantColor.js";
import { miniButtonStyle } from "../library/styles.js";
import PlayerControls from "./PlayerControls.jsx";
import ProgressBar from "./ProgressBar.jsx";
import VolumeControl from "./VolumeControl.jsx";
import QueuePanel from "./QueuePanel.jsx";

const barStyle = {
  position: "relative",
  height: "76px",
  flexShrink: 0,
  borderTop: "1px solid var(--color-border)",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0 1rem",
  gap: "1rem",
  transition: "background 500ms ease",
};

export default function PlayerBar() {
  const { currentSong } = usePlayer();
  const { toggleFavorite } = useLibrary();
  const api = useApi();
  const [showQueue, setShowQueue] = useState(false);
  const dominantColor = useDominantColor(currentSong && api ? api.coverUrl(currentSong.id) : null);

  if (!currentSong) {
    return (
      <div style={{ ...barStyle, justifyContent: "center" }}>
        <span style={{ color: "var(--color-text-secondary)", fontSize: "0.85rem" }}>
          Nada en reproducción — elige una canción de tu biblioteca.
        </span>
      </div>
    );
  }

  const gradientStyle = dominantColor
    ? { background: `linear-gradient(180deg, ${dominantColor}, transparent)` }
    : {};

  return (
    <div style={{ ...barStyle, ...gradientStyle }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", width: "220px", minWidth: 0 }}>
        {api && (
          <img
            src={api.coverUrl(currentSong.id)}
            alt=""
            style={{ width: "44px", height: "44px", borderRadius: "6px", objectFit: "cover", background: "#161616" }}
            onError={(event) => {
              event.target.style.visibility = "hidden";
            }}
          />
        )}
        <div style={{ overflow: "hidden" }}>
          <div
            style={{
              fontWeight: 600,
              fontSize: "0.85rem",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {currentSong.titulo}
          </div>
          <div
            style={{
              fontSize: "0.75rem",
              color: "var(--color-text-secondary)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {currentSong.artista ?? "Artista desconocido"}
          </div>
        </div>
        <button
          type="button"
          onClick={() => toggleFavorite(currentSong)}
          style={miniButtonStyle(currentSong.es_favorito)}
        >
          {currentSong.es_favorito ? "En favoritos" : "Favorito"}
        </button>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.3rem" }}>
        <PlayerControls />
        <ProgressBar />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", width: "220px", justifyContent: "flex-end" }}>
        <VolumeControl />
        <button type="button" onClick={() => setShowQueue((v) => !v)} style={miniButtonStyle(showQueue)}>
          Cola
        </button>
      </div>

      {showQueue && <QueuePanel onClose={() => setShowQueue(false)} />}
    </div>
  );
}
