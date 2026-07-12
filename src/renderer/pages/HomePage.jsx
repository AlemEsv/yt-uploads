import React, { useEffect, useMemo, useState } from "react";
import { HardDrive, Play } from "lucide-react";
import { SiSoundcloud, SiYoutube } from "react-icons/si";
import { useApi } from "../hooks/useApi.js";
import { useLibrary } from "../context/LibraryContext.jsx";
import { usePlayer } from "../context/PlayerContext.jsx";
import MetadataEditModal from "../components/metadata/MetadataEditModal.jsx";
import TrackRow from "../components/tracks/TrackRow.jsx";
import TrackRowMenu from "../components/tracks/TrackRowMenu.jsx";

const PLATFORM_CHIPS = [
  { id: "youtube", label: "YouTube", color: "#C71B1B", Icon: SiYoutube },
  { id: "soundcloud", label: "SoundCloud", color: "#E8720C", Icon: SiSoundcloud },
  { id: "importado", label: "Imported", color: "#35827D", Icon: HardDrive },
];

export default function HomePage({ onSelectView }) {
  const api = useApi();
  const { songs, applyUpdate, setPlatformFilter } = useLibrary();
  const { clearQueue, enqueue, playQueueItem, playNow } = usePlayer();
  const [history, setHistory] = useState([]);
  const [topCanciones, setTopCanciones] = useState([]);
  const [editingSong, setEditingSong] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);

  useEffect(() => {
    if (!api) return;
    api.getHistory(30).then(({ items }) => setHistory(items));
    api.getHistoryStats(7).then((stats) => setTopCanciones(stats.top_canciones));
  }, [api]);

  const recentSongs = useMemo(() => {
    const seen = new Set();
    const result = [];
    for (const item of history) {
      if (seen.has(item.song_id)) continue;
      const song = songs.find((s) => s.id === item.song_id);
      if (!song) continue;
      seen.add(item.song_id);
      result.push(song);
      if (result.length >= 6) break;
    }
    return result;
  }, [history, songs]);

  const topTracks = useMemo(
    () =>
      topCanciones
        .map((tc) => songs.find((s) => s.id === tc.song_id))
        .filter(Boolean)
        .slice(0, 3),
    [topCanciones, songs],
  );

  const likedTracks = useMemo(() => songs.filter((s) => s.es_favorito).slice(0, 3), [songs]);

  const lastPlayedSong = recentSongs[0] ?? null;

  const platformCounts = useMemo(() => {
    const map = {};
    for (const song of songs) {
      map[song.plataforma_origen] = (map[song.plataforma_origen] ?? 0) + 1;
    }
    return map;
  }, [songs]);

  function handlePlayNow() {
    const queueSongs =
      topTracks.length > 0 ? topTracks : [...songs].sort(() => Math.random() - 0.5).slice(0, 20);
    if (queueSongs.length === 0) return;
    clearQueue();
    queueSongs.forEach((song) => enqueue(song.id));
    playQueueItem(0);
  }

  function handlePlatformClick(platformId) {
    setPlatformFilter(platformId);
    onSelectView("library");
  }

  function handleContextMenu(event, song) {
    event.preventDefault();
    setContextMenu({
      song,
      anchor: {
        top: event.clientY,
        bottom: event.clientY,
        left: event.clientX,
        right: event.clientX,
      },
    });
  }

  return (
    <div className="page-surface min-h-full">
      {/* Hero banner */}
      <div className="relative h-[300px] overflow-hidden rounded-[15px] mb-6">
        {lastPlayedSong && api ? (
          <img
            src={api.coverUrl(lastPlayedSong.id, lastPlayedSong.fecha_modificacion)}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : null}
        <div
          className="absolute inset-0"
          style={
            lastPlayedSong
              ? {
                  background:
                    "linear-gradient(90deg, var(--color-hero-gradient-end) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.15) 100%)",
                }
              : {
                  background:
                    "linear-gradient(120deg, var(--color-hero-gradient-start) 0%, var(--color-hero-gradient-end) 85%)",
                }
          }
        />
        <div className="absolute bottom-0 left-0 p-8 text-white">
          <p className="text-[22px] font-bold mb-1">Welcome back!</p>
          <p className="text-[52px] font-medium leading-tight">Your Music</p>
          <div className="flex items-center gap-4 mt-2">
            <button
              type="button"
              onClick={handlePlayNow}
              disabled={songs.length === 0}
              className={`bg-[var(--color-cta-light-bg)] text-[var(--color-cta-light-text)] text-[13px] font-medium px-4 py-1.5 rounded-[5px] shadow transition-colors border-none ${
                songs.length === 0
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer hover:opacity-90"
              }`}
            >
              Play Now!
            </button>
          </div>
        </div>
      </div>

      {/* Recently Played */}
      {recentSongs.length > 0 && (
        <section className="mb-8">
          <h2 className="text-[22px] font-semibold mb-4 mt-0">Recently played</h2>
          <div className="grid grid-cols-6 gap-4">
            {recentSongs.map((song) => (
              <div
                key={song.id}
                className="group cursor-pointer"
                onClick={() => playNow(song.id)}
                onContextMenu={(event) => handleContextMenu(event, song)}
              >
                <div className="relative rounded-[9px] overflow-hidden aspect-square mb-2 bg-[var(--color-cover-placeholder-bg)]">
                  {api && (
                    <img
                      src={api.coverUrl(song.id, song.fecha_modificacion)}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <Play size={16} className="text-black fill-black ml-0.5" />
                    </span>
                  </div>
                </div>
                <p className="text-[15px] font-bold truncate m-0">{song.titulo}</p>
                <p className="text-[13px] text-[var(--color-inactive-text)] font-semibold truncate m-0">
                  {song.artista ?? "Unknown artist"}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Three-column section */}
      <div className="grid grid-cols-[1fr_1.6fr_1.6fr] gap-4">
        {/* Your Platforms */}
        <div className="glass rounded-[15px] p-5">
          <h3 className="text-[18px] font-bold mb-4 mt-0">Your Platforms</h3>
          <div className="flex flex-col gap-2">
            {PLATFORM_CHIPS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handlePlatformClick(p.id)}
                title={p.label}
                className="w-full h-[58px] rounded-[10px] flex flex-col items-center justify-center gap-0.5 text-white transition-opacity hover:opacity-90 border-none cursor-pointer"
                style={{ backgroundColor: p.color }}
              >
                <p.Icon size={18} />
                <span className="text-[13px] font-bold">{platformCounts[p.id] ?? 0}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Top Tracks */}
        <div className="glass rounded-[15px] p-5">
          <h3 className="text-[18px] font-bold mb-3 mt-0">Top Tracks</h3>
          {topTracks.length === 0 ? (
            <p className="text-[13px] text-[var(--color-muted-text)]">
              Play some songs to see your top tracks.
            </p>
          ) : (
            topTracks.map((song, idx) => (
              <TrackRow key={song.id} rank={idx + 1} song={song} onEdit={setEditingSong} />
            ))
          )}
        </div>

        {/* Liked Songs */}
        <div className="glass rounded-[15px] p-5">
          <h3 className="text-[18px] font-bold mb-3 mt-0">Liked Songs</h3>
          {likedTracks.length === 0 ? (
            <p className="text-[13px] text-[var(--color-muted-text)]">
              Like songs to see them here.
            </p>
          ) : (
            likedTracks.map((song, idx) => (
              <TrackRow key={song.id} rank={idx + 1} song={song} onEdit={setEditingSong} />
            ))
          )}
        </div>
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

      {contextMenu && (
        <TrackRowMenu
          song={contextMenu.song}
          anchor={contextMenu.anchor}
          onEdit={setEditingSong}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}
