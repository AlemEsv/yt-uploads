import React from "react";
import { usePlayer } from "../../context/PlayerContext.jsx";

export default function PlayerControls() {
  const { isPlaying, togglePlay, next, previous, isShuffle, toggleShuffle, loopMode, cycleLoopMode } = usePlayer();

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
      <button type="button" onClick={toggleShuffle} style={toggleStyle(isShuffle)}>
        Aleatorio
      </button>
      <button type="button" onClick={previous} style={controlButtonStyle}>
        Atrás
      </button>
      <button type="button" onClick={togglePlay} style={{ ...controlButtonStyle, fontWeight: 700 }}>
        {isPlaying ? "Pausa" : "Reproducir"}
      </button>
      <button type="button" onClick={next} style={controlButtonStyle}>
        Adelante
      </button>
      <button type="button" onClick={cycleLoopMode} style={toggleStyle(loopMode !== "off")}>
        {loopMode === "one" ? "Repetir 1" : "Repetir"}
      </button>
    </div>
  );
}

const controlButtonStyle = {
  padding: "0.3rem 0.6rem",
  borderRadius: "6px",
  border: "1px solid var(--color-border)",
  background: "transparent",
  color: "var(--color-text-primary)",
  cursor: "pointer",
  fontSize: "0.8rem",
};

function toggleStyle(active) {
  return { ...controlButtonStyle, background: active ? "var(--color-accent)" : "transparent" };
}
