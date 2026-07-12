import React from "react";
import { Heart, ListMusic } from "lucide-react";
import { usePlayer } from "../../context/PlayerContext.jsx";
import { useLibrary } from "../../context/LibraryContext.jsx";
import SongCover from "../common/SongCover.jsx";
import PlayerControls from "./PlayerControls.jsx";
import ProgressBar from "./ProgressBar.jsx";
import VolumeControl from "./VolumeControl.jsx";
import QueuePanel from "./QueuePanel.jsx";

export default function PlayerBar() {
  const { currentSong, showQueue, setShowQueue, toggleQueue } = usePlayer();
  const { toggleFavorite } = useLibrary();

  if (!currentSong) {
    return (
      <footer className="relative shrink-0 mx-4 mb-4 bg-[var(--color-player-bg)] border border-[var(--color-overlay-border)] rounded-[15px] h-[65px] flex items-center justify-center px-6">
        <span className="text-[13px] text-[var(--color-muted-text)]">
          Nothing playing — pick a song from your library.
        </span>
      </footer>
    );
  }

  return (
    <footer className="relative shrink-0 mx-4 mb-4 bg-[var(--color-player-bg)] border border-[var(--color-overlay-border)] rounded-[15px] h-[65px] flex items-center px-6 gap-4">
      <div className="flex items-center gap-3 w-[260px] min-w-0">
        <SongCover song={currentSong} className="w-[45px] h-[45px] rounded-[6px]" iconSize={20} />
        <div className="min-w-0">
          <p className="text-[15px] font-medium truncate m-0">{currentSong.titulo}</p>
          <p className="text-[12px] text-[var(--color-text-secondary)] truncate m-0">
            {currentSong.artista ?? "Unknown artist"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => toggleFavorite(currentSong)}
          title={currentSong.es_favorito ? "Liked" : "Like"}
          className="shrink-0 ml-1 bg-transparent border-none cursor-pointer p-0"
        >
          <Heart
            size={14}
            className={
              currentSong.es_favorito
                ? "text-[var(--color-heart)] fill-[var(--color-heart)]"
                : "text-[var(--color-muted-text)] hover:text-[var(--color-text-primary)]"
            }
          />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center gap-1 min-w-0">
        <PlayerControls />
        <ProgressBar />
      </div>

      <div className="flex items-center gap-3 w-[200px] justify-end shrink-0">
        <button
          type="button"
          onClick={toggleQueue}
          title="Queue"
          className="bg-transparent border-none cursor-pointer p-0"
        >
          <ListMusic
            size={16}
            className={
              showQueue
                ? "text-[var(--color-accent)]"
                : "text-[var(--color-muted-text)] hover:text-[var(--color-text-primary)]"
            }
          />
        </button>
        <VolumeControl />
      </div>

      {showQueue && <QueuePanel onClose={() => setShowQueue(false)} />}
    </footer>
  );
}
