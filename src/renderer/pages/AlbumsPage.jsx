import React, { useMemo, useState } from "react";
import { Play } from "lucide-react";
import { useApi } from "../hooks/useApi.js";
import { useLibrary } from "../context/LibraryContext.jsx";
import { usePlayer } from "../context/PlayerContext.jsx";
import EmptyState from "../components/common/EmptyState.jsx";

const SORT_OPTIONS = ["All Albums", "A–Z", "Most Tracks"];

export default function AlbumsPage() {
  const api = useApi();
  const { songs } = useLibrary();
  const { clearQueue, enqueue, playQueueItem } = usePlayer();
  const [sort, setSort] = useState("All Albums");

  const albums = useMemo(() => {
    const map = new Map();
    for (const song of songs) {
      const key = song.album ?? null;
      if (!map.has(key)) {
        map.set(key, { name: key ?? "Unknown album", songs: [] });
      }
      map.get(key).songs.push(song);
    }
    let list = [...map.values()];
    if (sort === "A–Z") {
      list = list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "Most Tracks") {
      list = list.sort((a, b) => b.songs.length - a.songs.length);
    }
    return list;
  }, [songs, sort]);

  const featured = useMemo(
    () => [...albums].sort((a, b) => b.songs.length - a.songs.length)[0] ?? null,
    [albums],
  );

  function playAlbum(album) {
    if (album.songs.length === 0) return;
    clearQueue();
    album.songs.forEach((song) => enqueue(song.id));
    playQueueItem(0);
  }

  return (
    <div className="page-surface min-h-full p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[28px] font-bold m-0">Albums</h1>
        <div className="flex gap-2">
          {SORT_OPTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSort(s)}
              className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors border-none cursor-pointer ${
                sort === s
                  ? "bg-[var(--color-accent)] text-white"
                  : "glass text-[var(--color-muted-text)] hover:text-white hover:bg-white/10"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {albums.length === 0 ? (
        <EmptyState
          title="Nothing here yet"
          description="Add songs to your library to browse them by album."
        />
      ) : (
        <>
          {featured && (
            <div className="relative glass rounded-[15px] overflow-hidden mb-8 flex">
              {api && featured.songs[0] && (
                <img
                  src={api.coverUrl(featured.songs[0].id, featured.songs[0].fecha_modificacion)}
                  alt=""
                  className="w-[200px] h-[200px] object-cover bg-[var(--color-cover-placeholder-bg)]"
                />
              )}
              <div className="p-6 flex flex-col justify-between">
                <div>
                  <p className="text-[11px] font-semibold tracking-widest text-[var(--color-accent)] mb-1 mt-0">
                    FEATURED ALBUM
                  </p>
                  <h2 className="text-[32px] font-bold mb-1 mt-0">{featured.name}</h2>
                  <p className="text-[16px] text-[var(--color-text-secondary)] font-semibold m-0">
                    {featured.songs[0]?.artista ?? "Various"} · {featured.songs.length} songs
                  </p>
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => playAlbum(featured)}
                    className="flex items-center gap-2 bg-[var(--color-accent)] hover:opacity-90 text-white px-6 py-2.5 rounded-full font-semibold text-[14px] transition-colors border-none cursor-pointer"
                  >
                    <Play size={16} className="fill-white" /> Play All
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-4 gap-4">
            {albums.map((album) => (
              <div
                key={album.name}
                className="group cursor-pointer glass rounded-[12px] p-4 hover:bg-white/5 transition-colors"
                onClick={() => playAlbum(album)}
              >
                <div className="relative rounded-[9px] overflow-hidden aspect-square mb-3 bg-[var(--color-cover-placeholder-bg)]">
                  {api && album.songs[0] && (
                    <img
                      src={api.coverUrl(album.songs[0].id, album.songs[0].fecha_modificacion)}
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
                <p className="text-[15px] font-bold truncate m-0">{album.name}</p>
                <p className="text-[13px] text-[var(--color-muted-text)] truncate mt-0.5 mb-0">
                  {album.songs[0]?.artista ?? "Various"} · {album.songs.length} tracks
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
