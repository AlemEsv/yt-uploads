import React from "react";
import { usePlayer } from "../../context/PlayerContext.jsx";
import { formatTime } from "../../utils/formatTime.js";

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
      <span
        style={{
          fontSize: "0.7rem",
          color: "var(--color-text-secondary)",
          fontFamily: "var(--font-secondary)",
        }}
      >
        {formatTime(currentTime)}
      </span>
      <input
        type="range"
        min={0}
        max={duration || 0}
        value={Math.min(currentTime, duration || 0)}
        onChange={(event) => seek(Number(event.target.value))}
        style={{ flex: 1, accentColor: "var(--color-progress-active)" }}
      />
      <span
        style={{
          fontSize: "0.7rem",
          color: "var(--color-text-secondary)",
          fontFamily: "var(--font-secondary)",
        }}
      >
        {formatTime(duration)}
      </span>
    </div>
  );
}
