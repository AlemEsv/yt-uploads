import React from "react";
import { Play, Pause, SkipBack, SkipForward, X } from "lucide-react";
import { useRemotePlayerState } from "./hooks/useRemotePlayerState.js";
import SongCover from "./components/common/SongCover.jsx";

const transportButtonStyle = {
  width: "26px",
  height: "26px",
  borderRadius: "50%",
  background: "transparent",
  border: "none",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "var(--color-text-primary)",
};

export default function MiniPlayer() {
  const { currentSong, isPlaying, togglePlay, next, previous } = useRemotePlayerState();

  function handleRestore() {
    window.sounddock?.restoreMain();
  }

  return (
    <div
      style={{
        width: "380px",
        height: "90px",
        borderRadius: "14px",
        background: "var(--color-player-bg)",
        border: "1px solid var(--color-overlay-border)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "0 14px",
        fontFamily: "Poppins, sans-serif",
        color: "var(--color-text-primary)",
        userSelect: "none",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Drag region covers the whole widget */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          WebkitAppRegion: "drag",
          zIndex: 0,
        }}
      />

      {/* Spinning disc — album art */}
      <div
        className={`shrink-0 rounded-full ${isPlaying ? "disc-spin" : "disc-spin disc-spin-paused"}`}
        style={{ zIndex: 1 }}
      >
        <SongCover song={currentSong} className="w-[54px] h-[54px] rounded-full" iconSize={24} />
      </div>

      {/* Song info */}
      <div style={{ flex: 1, minWidth: 0, zIndex: 1 }}>
        <p
          style={{
            margin: 0,
            fontSize: "13px",
            fontWeight: 600,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {currentSong?.titulo ?? "No song playing"}
        </p>
        <p
          style={{
            margin: 0,
            fontSize: "11px",
            color: "var(--color-muted-text)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {currentSong?.artista ?? "—"}
        </p>
      </div>

      {/* Controls — no-drag */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          zIndex: 1,
          WebkitAppRegion: "no-drag",
        }}
      >
        <button type="button" onClick={previous} style={transportButtonStyle} title="Previous">
          <SkipBack size={14} fill="var(--color-text-primary)" />
        </button>

        <button
          type="button"
          onClick={togglePlay}
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            background: "var(--color-overlay-hover)",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--color-text-primary)",
          }}
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <Pause size={14} fill="var(--color-text-primary)" />
          ) : (
            <Play size={14} fill="var(--color-text-primary)" />
          )}
        </button>

        <button type="button" onClick={next} style={transportButtonStyle} title="Next">
          <SkipForward size={14} fill="var(--color-text-primary)" />
        </button>

        <button
          type="button"
          onClick={handleRestore}
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--color-muted-text)",
          }}
          title="Abrir SoundDock"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
