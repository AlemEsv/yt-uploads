import React, { useEffect, useMemo, useState } from "react";
import { ListMusic, Pencil, Play, Shuffle, Trash2, X } from "lucide-react";
import { useApi } from "../hooks/useApi.js";
import { useLibrary } from "../context/LibraryContext.jsx";
import { usePlayer } from "../context/PlayerContext.jsx";
import { usePlaylists } from "../context/PlaylistsContext.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import MetadataEditModal from "../components/metadata/MetadataEditModal.jsx";
import TrackTable from "../components/tracks/TrackTable.jsx";

function playlistGradient(id) {
  let hash = 0;
  const str = String(id);
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) % 360;
  }
  return `linear-gradient(135deg, hsl(${hash}, 55%, 32%) 0%, rgba(10, 10, 12, 0.95) 90%)`;
}

export default function PlaylistsPage({ activePlaylistId, onOpenPlaylist }) {
  const api = useApi();
  const { songs, applyUpdate } = useLibrary();
  const { playlists, renamePlaylist, deletePlaylist, removeSong } = usePlaylists();
  const { clearQueue, enqueue, playQueueItem } = usePlayer();
  const [detail, setDetail] = useState(null);
  const [editingSong, setEditingSong] = useState(null);
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState("");

  const playlistId = activePlaylistId ?? playlists[0]?.id ?? null;

  useEffect(() => {
    if (!api || playlistId == null) {
      setDetail(null);
      return;
    }
    api.getPlaylist(playlistId).then(setDetail);
  }, [api, playlistId, playlists]);

  const rows = useMemo(() => {
    if (!detail) return [];
    return detail.canciones
      .map((cancion) => {
        const song = songs.find((s) => s.id === cancion.id) ?? cancion;
        return { song, key: cancion.id };
      })
      .filter(Boolean);
  }, [detail, songs]);

  function playAll(shuffled) {
    if (rows.length === 0) return;
    const list = shuffled ? [...rows].sort(() => Math.random() - 0.5) : rows;
    clearQueue();
    list.forEach(({ song }) => enqueue(song.id));
    playQueueItem(0);
  }

  async function handleRename(event) {
    event.preventDefault();
    if (!newName.trim()) return;
    await renamePlaylist(detail.id, newName.trim());
    setDetail((current) => ({ ...current, nombre: newName.trim() }));
    setRenaming(false);
  }

  async function handleDelete() {
    if (!confirm(`Delete playlist "${detail.nombre}"? Songs stay in your library.`)) return;
    await deletePlaylist(detail.id);
    onOpenPlaylist(null);
  }

  async function handleRemoveSong(songId) {
    await removeSong(detail.id, songId);
    setDetail((current) => ({
      ...current,
      canciones: current.canciones.filter((c) => c.id !== songId),
    }));
  }

  if (playlistId == null) {
    return (
      <div className="page-surface min-h-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-[28px] font-bold m-0">Playlists</h1>
        </div>
        <div className="glass rounded-[15px] flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="w-14 h-14 rounded-full bg-[var(--color-accent-soft)] flex items-center justify-center mb-4">
            <ListMusic size={24} className="text-[var(--color-accent)]" />
          </div>
          <h2 className="text-[18px] font-bold m-0">No playlists yet</h2>
          <p className="text-[13px] text-[var(--color-muted-text)] mt-2 mb-0 max-w-[360px]">
            Create your first playlist from the sidebar and add songs from any track's menu.
          </p>
        </div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="page-surface min-h-full p-6">
        <p className="text-[13px] text-[var(--color-muted-text)]">Loading playlist...</p>
      </div>
    );
  }

  const columns = [
    {
      key: "album",
      header: "ALBUM",
      className: "w-[180px] text-[13px] text-[var(--color-muted-text)] truncate shrink-0",
      render: (song) => song.album ?? "—",
    },
    {
      key: "remove",
      header: "",
      className: "w-8 flex justify-end shrink-0",
      render: (song) => (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            handleRemoveSong(song.id);
          }}
          title="Remove from playlist"
          className="bg-transparent border-none cursor-pointer p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X
            size={14}
            className="text-[var(--color-muted-text)] hover:text-[var(--color-text-primary)]"
          />
        </button>
      ),
    },
  ];

  return (
    <div className="page-surface min-h-full">
      <div className="relative rounded-t-[15px] overflow-hidden">
        <div
          className="h-[200px] px-8 pt-8 pb-6 flex flex-col justify-end"
          style={{ background: playlistGradient(detail.id) }}
        >
          <div className="flex items-end gap-6">
            <div className="w-[120px] h-[120px] rounded-[10px] flex items-center justify-center shadow-2xl bg-white/10">
              <ListMusic size={52} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-semibold tracking-widest text-white/80 mb-1 mt-0">
                PLAYLIST
              </p>
              {renaming ? (
                <form onSubmit={handleRename} className="flex items-center gap-2">
                  <input
                    autoFocus
                    value={newName}
                    onChange={(event) => setNewName(event.target.value)}
                    className="text-[28px] font-bold bg-black/40 border border-white/20 rounded-[8px] px-3 py-1 text-white outline-none"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-[8px] border-none bg-white text-black text-[13px] font-semibold cursor-pointer"
                  >
                    Save
                  </button>
                </form>
              ) : (
                <h1 className="text-[42px] font-bold m-0 truncate text-white">{detail.nombre}</h1>
              )}
              <p className="text-[14px] text-white/70 mt-1 mb-0">{rows.length} songs</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 px-6 py-5">
        <button
          type="button"
          onClick={() => playAll(false)}
          disabled={rows.length === 0}
          className={`w-[52px] h-[52px] rounded-full flex items-center justify-center shadow-lg transition-colors border-none bg-[var(--color-accent)] ${
            rows.length === 0 ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:opacity-90"
          }`}
          title="Play all"
        >
          <Play size={22} className="text-white fill-white ml-1" />
        </button>
        <button
          type="button"
          onClick={() => playAll(true)}
          disabled={rows.length === 0}
          className={`w-[42px] h-[42px] border border-[var(--color-overlay-border-strong)] rounded-full flex items-center justify-center transition-colors bg-transparent ${
            rows.length === 0
              ? "opacity-50 cursor-not-allowed"
              : "cursor-pointer hover:border-[var(--color-overlay-border-strong)]"
          }`}
          title="Shuffle"
        >
          <Shuffle size={16} className="text-[var(--color-text-primary)]" />
        </button>

        <div className="flex-1" />

        <button
          type="button"
          onClick={() => {
            setNewName(detail.nombre);
            setRenaming(true);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-[8px] border border-[var(--color-overlay-border)] bg-transparent text-[var(--color-text-primary)] text-[13px] cursor-pointer hover:bg-[var(--color-overlay-subtle)] transition-colors"
        >
          <Pencil size={13} /> Rename
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="flex items-center gap-2 px-4 py-2 rounded-[8px] border border-[var(--color-overlay-border)] bg-transparent text-[var(--color-heart)] text-[13px] cursor-pointer hover:bg-[var(--color-overlay-subtle)] transition-colors"
        >
          <Trash2 size={13} /> Delete
        </button>
      </div>

      <div className="px-4 pb-6">
        {rows.length === 0 ? (
          <EmptyState
            title="This playlist is empty"
            description="Add songs from the '…' menu of any track in your library."
          />
        ) : (
          <TrackTable rows={rows} columns={columns} onEdit={setEditingSong} />
        )}
      </div>

      {editingSong && (
        <MetadataEditModal
          cancion={editingSong}
          onSaved={(updated) => {
            applyUpdate(updated);
            setEditingSong(updated);
          }}
          onClose={() => setEditingSong(null)}
        />
      )}
    </div>
  );
}
