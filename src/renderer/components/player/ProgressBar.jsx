import React from "react";
import { usePlayer } from "../../context/PlayerContext.jsx";

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

export default function ProgressBar() {
  const { currentTime, duration, seek } = usePlayer();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        width: "100%",
        maxWidth: "420px",
      }}
    >
      <span style={{ fontSize: "0.7rem", color: "var(--color-text-secondary)" }}>
        {formatTime(currentTime)}
      </span>
      <input
        type="range"
        min={0}
        max={duration || 0}
        value={Math.min(currentTime, duration || 0)}
        onChange={(event) => seek(Number(event.target.value))}
        style={{ flex: 1 }}
      />
      <span style={{ fontSize: "0.7rem", color: "var(--color-text-secondary)" }}>
        {formatTime(duration)}
      </span>
    </div>
  );
}
