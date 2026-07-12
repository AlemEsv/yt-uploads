import React from "react";
import { usePlayer } from "../../context/PlayerContext.jsx";
import { formatTime } from "../../utils/formatTime.js";

export default function ProgressBar() {
  const { currentTime, duration, seek } = usePlayer();

  return (
    <div className="w-full max-w-[400px] flex items-center gap-2">
      <span
        className="text-[10px] text-[#9b9b9b] w-7 text-right"
        style={{ fontFamily: "var(--font-secondary)" }}
      >
        {formatTime(currentTime)}
      </span>
      <input
        type="range"
        min={0}
        max={duration || 0}
        value={Math.min(currentTime, duration || 0)}
        onChange={(event) => seek(Number(event.target.value))}
        className="flex-1 h-[3px] cursor-pointer"
        style={{ accentColor: "#0c1b6a" }}
      />
      <span
        className="text-[10px] text-[#9b9b9b] w-7"
        style={{ fontFamily: "var(--font-secondary)" }}
      >
        {formatTime(duration)}
      </span>
    </div>
  );
}
