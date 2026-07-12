import React from "react";
import { Pause, Play, Repeat, Repeat1, Shuffle, SkipBack, SkipForward } from "lucide-react";
import { usePlayer } from "../../context/PlayerContext.jsx";

export default function PlayerControls() {
  const {
    isPlaying,
    togglePlay,
    next,
    previous,
    isShuffle,
    toggleShuffle,
    loopMode,
    cycleLoopMode,
  } = usePlayer();

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
      <button
        type="button"
        onClick={toggleShuffle}
        title="Aleatorio"
        style={flatButtonStyle(isShuffle)}
      >
        <Shuffle size={19} strokeWidth={2.25} />
      </button>
      <button type="button" onClick={previous} title="Atrás" style={flatButtonStyle(false)}>
        <SkipBack size={22} strokeWidth={2.25} />
      </button>
      <button
        type="button"
        onClick={togglePlay}
        title={isPlaying ? "Pausa" : "Reproducir"}
        style={playButtonStyle}
      >
        {isPlaying ? (
          <Pause size={20} strokeWidth={2.5} fill="var(--color-cta-light-text)" />
        ) : (
          <Play size={20} strokeWidth={2.5} fill="var(--color-cta-light-text)" />
        )}
      </button>
      <button type="button" onClick={next} title="Adelante" style={flatButtonStyle(false)}>
        <SkipForward size={22} strokeWidth={2.25} />
      </button>
      <button
        type="button"
        onClick={cycleLoopMode}
        title={loopMode === "one" ? "Repetir 1" : "Repetir"}
        style={flatButtonStyle(loopMode !== "off")}
      >
        {loopMode === "one" ? (
          <Repeat1 size={19} strokeWidth={2.25} />
        ) : (
          <Repeat size={19} strokeWidth={2.25} />
        )}
      </button>
    </div>
  );
}

function flatButtonStyle(active) {
  return {
    width: "34px",
    height: "34px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    borderRadius: "50%",
    background: "transparent",
    color: active ? "var(--color-accent)" : "var(--color-text-primary)",
    cursor: "pointer",
  };
}

const playButtonStyle = {
  width: "40px",
  height: "40px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "none",
  borderRadius: "50%",
  background: "var(--color-cta-light-bg)",
  color: "var(--color-cta-light-text)",
  cursor: "pointer",
};
