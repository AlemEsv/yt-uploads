import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronRight } from "lucide-react";
import { useLibrary } from "../../context/LibraryContext.jsx";
import { usePlaylists } from "../../context/PlaylistsContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";

const MENU_WIDTH = 190;
const SUBMENU_WIDTH = 180;
const VIEWPORT_MARGIN = 8;

// Dropdown that opens below (or above, if there's no room) its anchor,
// right-aligned to it — used for the top-level "..." menu.
function useFixedPosition(anchor, ref, width) {
  const [style, setStyle] = useState({ visibility: "hidden" });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !anchor) return;
    const height = el.offsetHeight;
    const openUpward = anchor.bottom + height > window.innerHeight - VIEWPORT_MARGIN;
    const top = openUpward
      ? Math.max(VIEWPORT_MARGIN, anchor.top - height)
      : Math.min(anchor.bottom, window.innerHeight - height - VIEWPORT_MARGIN);
    const left = Math.min(
      Math.max(VIEWPORT_MARGIN, anchor.right - width),
      window.innerWidth - width - VIEWPORT_MARGIN,
    );
    setStyle({ position: "fixed", top, left, width, visibility: "visible" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anchor, width]);

  return style;
}

// Flyout that opens to the side of its anchor (left, or right if there's no
// room on the left) — used for the "Add to playlist" submenu.
function useFlyoutPosition(anchor, ref, width) {
  const [style, setStyle] = useState({ visibility: "hidden" });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !anchor) return;
    const height = el.offsetHeight;
    const openRight = anchor.left - width - VIEWPORT_MARGIN < 0;
    const left = openRight ? anchor.right + 4 : anchor.left - width - 4;
    const top = Math.min(
      Math.max(VIEWPORT_MARGIN, anchor.top),
      window.innerHeight - height - VIEWPORT_MARGIN,
    );
    setStyle({ position: "fixed", top, left, width, visibility: "visible" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anchor, width]);

  return style;
}

function AddToPlaylistSubmenu({ anchorRect, onPick }) {
  const { playlists } = usePlaylists();
  const submenuRef = useRef(null);
  const style = useFlyoutPosition(anchorRect, submenuRef, SUBMENU_WIDTH);

  return createPortal(
    <div
      ref={submenuRef}
      style={style}
      className="popover-in glass border border-[var(--color-overlay-border)] rounded-[8px] max-h-[220px] overflow-y-auto z-[3100]"
    >
      {playlists.length === 0 ? (
        <p className="m-0 px-3 py-2 text-[12px] text-[var(--color-muted-text)]">
          No playlists yet — create one from the sidebar.
        </p>
      ) : (
        playlists.map((playlist) => (
          <button
            key={playlist.id}
            type="button"
            onClick={() => onPick(playlist)}
            className={itemClass}
          >
            <span className="truncate block">{playlist.nombre}</span>
          </button>
        ))
      )}
    </div>,
    document.body,
  );
}

export default function TrackRowMenu({ song, anchor, onEdit, onClose }) {
  const { removeSong } = useLibrary();
  const { addSong } = usePlaylists();
  const { showSuccess } = useToast();
  const [showPlaylists, setShowPlaylists] = useState(false);
  const menuRef = useRef(null);
  const addToPlaylistBtnRef = useRef(null);

  const menuStyle = useFixedPosition(anchor, menuRef, MENU_WIDTH);

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

  return createPortal(
    <div
      ref={menuRef}
      style={menuStyle}
      className="popover-in glass border border-[var(--color-overlay-border)] rounded-[8px] z-[3000]"
    >
      <button
        ref={addToPlaylistBtnRef}
        type="button"
        onClick={() => setShowPlaylists((v) => !v)}
        className={`${itemClass} flex items-center justify-between`}
      >
        Add to playlist
        <ChevronRight size={13} className="text-[var(--color-muted-text)]" />
      </button>
      {showPlaylists && (
        <AddToPlaylistSubmenu
          anchorRect={addToPlaylistBtnRef.current?.getBoundingClientRect()}
          onPick={handleAddToPlaylist}
        />
      )}
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
    </div>,
    document.body,
  );
}

const itemClass =
  "block w-full text-left px-3 py-2 border-none bg-transparent text-[var(--color-text-primary)] text-[13px] cursor-pointer hover:bg-[var(--color-overlay-hover)] transition-colors";
