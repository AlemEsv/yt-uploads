import React from "react";
import { Volume1, Volume2, VolumeX } from "lucide-react";
import { usePlayer } from "../../context/PlayerContext.jsx";

function VolumeIcon({ volume }) {
  if (volume === 0) return <VolumeX size={16} />;
  if (volume < 0.5) return <Volume1 size={16} />;
  return <Volume2 size={16} />;
}

export default function VolumeControl() {
  const { volume, setVolume } = usePlayer();

  return (
    <div className="flex items-center gap-2">
      <span className="text-[var(--color-muted-text)]" title="Volume">
        <VolumeIcon volume={volume} />
      </span>
      <input
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={volume}
        onChange={(event) => setVolume(Number(event.target.value))}
        className="w-[101px] h-[4px] cursor-pointer"
        style={{ accentColor: "var(--color-text-primary)" }}
      />
    </div>
  );
}
