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
    <div className="flex items-center gap-6">
      <button
        type="button"
        onClick={toggleShuffle}
        title="Shuffle"
        className={`bg-transparent border-none cursor-pointer p-0 transition-colors ${
          isShuffle ? "text-[var(--color-accent)]" : "text-white/60 hover:text-white"
        }`}
      >
        <Shuffle size={16} />
      </button>
      <button
        type="button"
        onClick={previous}
        title="Previous"
        className="bg-transparent border-none cursor-pointer p-0 text-white hover:text-white/80 transition-colors"
      >
        <SkipBack size={18} />
      </button>
      <button
        type="button"
        onClick={togglePlay}
        title={isPlaying ? "Pause" : "Play"}
        className="w-[34px] h-[34px] bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform border-none cursor-pointer"
      >
        {isPlaying ? (
          <Pause size={16} className="text-black fill-black" />
        ) : (
          <Play size={16} className="text-black fill-black ml-0.5" />
        )}
      </button>
      <button
        type="button"
        onClick={next}
        title="Next"
        className="bg-transparent border-none cursor-pointer p-0 text-white hover:text-white/80 transition-colors"
      >
        <SkipForward size={18} />
      </button>
      <button
        type="button"
        onClick={cycleLoopMode}
        title={loopMode === "one" ? "Repeat one" : "Repeat"}
        className={`bg-transparent border-none cursor-pointer p-0 transition-colors ${
          loopMode !== "off" ? "text-[var(--color-accent)]" : "text-white/60 hover:text-white"
        }`}
      >
        {loopMode === "one" ? <Repeat1 size={16} /> : <Repeat size={16} />}
      </button>
    </div>
  );
}
