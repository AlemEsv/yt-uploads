import React, { useEffect, useRef, useState } from "react";
import { ChevronRight } from "lucide-react";
import { useLibrary } from "../../context/LibraryContext.jsx";
import { usePlaylists } from "../../context/PlaylistsContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";

export default function TrackRowMenu({ song, onEdit, onClose }) {
  const { removeSong } = useLibrary();
  const { playlists, addSong } = usePlaylists();
  const { showSuccess } = useToast();
  const [showPlaylists, setShowPlaylists] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  async function handleAddToPlaylist(playlist) {
    await addSong(playlist.id, song.id);
    showSuccess({
      title: "Added to playlist",
      message: `"${song.titulo}" was added to ${playlist.nombre}.`,
    });
    onClose();
  }

  return (
    <div
      ref={menuRef}
      className="popover-in absolute top-full right-0 mt-1 bg-[#080808] border border-white/10 rounded-[8px] min-w-[180px] z-[1000]"
    >
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowPlaylists((v) => !v)}
          className={`${itemClass} flex items-center justify-between`}
        >
          Add to playlist
          <ChevronRight size={13} className="text-white/50" />
        </button>
        {showPlaylists && (
          <div className="popover-in absolute top-0 right-full mr-1 bg-[#080808] border border-white/10 rounded-[8px] min-w-[160px] max-h-[220px] overflow-y-auto z-[1001]">
            {playlists.length === 0 ? (
              <p className="m-0 px-3 py-2 text-[12px] text-[#9b9b9b]">
                No playlists yet — create one from the sidebar.
              </p>
            ) : (
              playlists.map((playlist) => (
                <button
                  key={playlist.id}
                  type="button"
                  onClick={() => handleAddToPlaylist(playlist)}
                  className={itemClass}
                >
                  <span className="truncate block">{playlist.nombre}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>
      {onEdit && (
        <button
          type="button"
          onClick={() => {
            onEdit(song);
            onClose();
          }}
          className={itemClass}
        >
          Edit
        </button>
      )}
      <button
        type="button"
        onClick={() => {
          window.sounddock.showItemInFolder(song.ruta_archivo);
          onClose();
        }}
        className={itemClass}
      >
        Show in folder
      </button>
      <button
        type="button"
        onClick={() => {
          if (confirm(`Remove "${song.titulo}" from your library?`)) removeSong(song.id);
          onClose();
        }}
        className={itemClass}
      >
        Delete
      </button>
    </div>
  );
}

const itemClass =
  "block w-full text-left px-3 py-2 border-none bg-transparent text-white text-[13px] cursor-pointer hover:bg-white/10 transition-colors";
