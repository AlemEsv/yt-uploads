import React from "react";
import { Volume1, Volume2, VolumeX } from "lucide-react";
import { usePlayer } from "../../context/PlayerContext.jsx";

function VolumeIcon({ volume }) {
  if (volume === 0) return <VolumeX size={19} strokeWidth={2.25} />;
  if (volume < 0.5) return <Volume1 size={19} strokeWidth={2.25} />;
  return <Volume2 size={19} strokeWidth={2.25} />;
}

export default function VolumeControl() {
  const { volume, setVolume } = usePlayer();

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
      <span style={{ color: "var(--color-text-secondary)" }} title="Volumen">
        <VolumeIcon volume={volume} />
      </span>
      <input
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={volume}
        onChange={(event) => setVolume(Number(event.target.value))}
        style={{ width: "80px", accentColor: "var(--color-progress-inactive)" }}
      />
    </div>
  );
}
