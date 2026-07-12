import React, { useMemo, useState } from "react";
import { Heart, Play, Shuffle } from "lucide-react";
import { useLibrary } from "../context/LibraryContext.jsx";
import { usePlayer } from "../context/PlayerContext.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import MetadataEditModal from "../components/metadata/MetadataEditModal.jsx";
import TrackTable from "../components/tracks/TrackTable.jsx";

function formatAddedDate(fecha) {
  if (!fecha) return "—";
  return new Date(`${fecha.replace(" ", "T")}Z`).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function FavoritesPage() {
  const { songs, applyUpdate, searchQuery } = useLibrary();
  const { clearQueue, enqueue, playQueueItem } = usePlayer();
  const [editingSong, setEditingSong] = useState(null);

  const favoritos = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return songs.filter(
      (song) =>
        song.es_favorito &&
        (!q ||
          song.titulo.toLowerCase().includes(q) ||
          (song.artista ?? "").toLowerCase().includes(q)),
    );
  }, [songs, searchQuery]);

  function playAll(shuffled) {
    if (favoritos.length === 0) return;
    const list = shuffled ? [...favoritos].sort(() => Math.random() - 0.5) : favoritos;
    clearQueue();
    list.forEach((song) => enqueue(song.id));
    playQueueItem(0);
  }

  const columns = [
    {
      key: "album",
      header: "ALBUM",
      className: "w-[200px] text-[13px] text-[#9b9b9b] truncate shrink-0",
      render: (song) => song.album ?? "—",
    },
    {
      key: "added",
      header: "DATE ADDED",
      className: "w-[130px] text-[12px] text-[#9b9b9b] shrink-0",
      render: (song) => formatAddedDate(song.fecha_descarga),
    },
  ];

  return (
    <div className="page-surface min-h-full">
      {/* Header with gradient */}
      <div className="relative rounded-t-[15px] overflow-hidden">
        <div
          className="h-[200px] px-8 pt-8 pb-6 flex flex-col justify-end"
          style={{
            background:
              "linear-gradient(180deg, var(--color-hero-gradient-start) 0%, var(--color-hero-gradient-end) 100%)",
          }}
        >
          <div className="flex items-end gap-6">
            <div
              className="w-[120px] h-[120px] rounded-[10px] flex items-center justify-center shadow-2xl"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-hero-gradient-start), var(--color-hero-gradient-mid))",
              }}
            >
              <Heart size={52} className="text-white fill-white" />
            </div>
            <div>
              <p className="text-[12px] font-semibold tracking-widest text-white/80 mb-1 mt-0">
                PLAYLIST
              </p>
              <h1 className="text-[42px] font-bold m-0">Liked Songs</h1>
              <p className="text-[14px] text-[#b2b2b2] mt-1 mb-0">{favoritos.length} songs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 px-6 py-5">
        <button
          type="button"
          onClick={() => playAll(false)}
          disabled={favoritos.length === 0}
          className={`w-[52px] h-[52px] rounded-full flex items-center justify-center shadow-lg transition-colors border-none ${
            favoritos.length === 0
              ? "opacity-50 cursor-not-allowed bg-[var(--color-accent)]"
              : "cursor-pointer bg-[var(--color-accent)] hover:opacity-90"
          }`}
          title="Play all"
        >
          <Play size={22} className="text-white fill-white ml-1" />
        </button>
        <button
          type="button"
          onClick={() => playAll(true)}
          disabled={favoritos.length === 0}
          className={`w-[42px] h-[42px] border border-white/20 rounded-full flex items-center justify-center transition-colors bg-transparent ${
            favoritos.length === 0
              ? "opacity-50 cursor-not-allowed"
              : "cursor-pointer hover:border-white/50"
          }`}
          title="Shuffle"
        >
          <Shuffle size={16} className="text-white" />
        </button>
      </div>

      {/* Track list */}
      <div className="px-4 pb-6">
        {favoritos.length === 0 ? (
          <EmptyState
            title="No liked songs yet"
            description="Tap the heart on any song in your library to add it here."
          />
        ) : (
          <TrackTable
            rows={favoritos.map((song) => ({ song }))}
            columns={columns}
            onEdit={setEditingSong}
          />
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
