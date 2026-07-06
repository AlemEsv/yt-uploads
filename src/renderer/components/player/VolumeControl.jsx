import React from "react";
import { usePlayer } from "../../context/PlayerContext.jsx";

export default function VolumeControl() {
  const { volume, setVolume } = usePlayer();

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
      <span style={{ fontSize: "0.7rem", color: "var(--color-text-secondary)" }}>Vol</span>
      <input
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={volume}
        onChange={(event) => setVolume(Number(event.target.value))}
        style={{ width: "80px" }}
      />
    </div>
  );
}
