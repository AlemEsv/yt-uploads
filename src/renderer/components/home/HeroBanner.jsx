import React from "react";
import { useTheme } from "../../context/ThemeContext.jsx";
import { useLibrary } from "../../context/LibraryContext.jsx";
import { usePlayer } from "../../context/PlayerContext.jsx";

export default function HeroBanner({ topCanciones }) {
  const { profiles, activeProfileId } = useTheme();
  const { songs } = useLibrary();
  const { clearQueue, enqueue, playQueueItem } = usePlayer();

  const activeProfile = profiles.find((p) => p.id === activeProfileId);
  const accent = activeProfile?.paleta_colores?.accent ?? "var(--color-accent)";

  function handlePlayNow() {
    const matched = topCanciones
      .map((tc) => songs.find((s) => s.id === tc.song_id))
      .filter(Boolean);
    const queueSongs =
      matched.length > 0 ? matched : [...songs].sort(() => Math.random() - 0.5).slice(0, 20);
    if (queueSongs.length === 0) return;
    clearQueue();
    queueSongs.forEach((song) => enqueue(song.id));
    playQueueItem(0);
  }

  return (
    <div
      style={{
        borderRadius: "15px",
        padding: "2rem",
        minHeight: "220px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        gap: "0.5rem",
        background: `linear-gradient(135deg, ${accent}, var(--color-bg-base))`,
      }}
    >
      <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>Perfil activo</div>
      <div
        style={{
          fontWeight: 500,
          fontSize: "clamp(2rem, 5vw, 3.5rem)",
          lineHeight: 1.05,
        }}
      >
        {activeProfile?.nombre ?? "Sin perfil temático"}
      </div>
      <button
        type="button"
        onClick={handlePlayNow}
        disabled={songs.length === 0}
        style={{
          alignSelf: "flex-start",
          marginTop: "0.5rem",
          padding: "0.45rem 1.25rem",
          borderRadius: "5px",
          border: "none",
          background: "var(--color-cta-light-bg)",
          color: "var(--color-cta-light-text)",
          fontWeight: 500,
          fontSize: "0.85rem",
          cursor: songs.length === 0 ? "not-allowed" : "pointer",
          opacity: songs.length === 0 ? 0.6 : 1,
          boxShadow: "0 4px 12px rgba(0,0,0,0.35)",
        }}
      >
        Reproducir ahora
      </button>
    </div>
  );
}
