import React, { useMemo } from "react";
import { Music2 } from "lucide-react";
import { useLibrary } from "../context/LibraryContext.jsx";
import EmptyState from "../components/common/EmptyState.jsx";

const GENRE_COLORS = [
  "#C30DD2",
  "#C71B1B",
  "#7D25ED",
  "#207C29",
  "#B8860B",
  "#8B1A6B",
  "#1A5276",
  "#6E2F0E",
  "#2E7D32",
  "#37474F",
  "#00695C",
  "#121F4A",
];

export default function GenresPage({ onSelectView }) {
  const { songs, setGenreFilter } = useLibrary();

  const genres = useMemo(() => {
    const map = new Map();
    for (const song of songs) {
      const key = song.genero ?? null;
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return [...map.entries()]
      .map(([value, count]) => ({
        value,
        label: value ?? "No genre",
        count,
      }))
      .sort((a, b) => b.count - a.count);
  }, [songs]);

  function handleGenreClick(genre) {
    setGenreFilter({ value: genre.value, label: genre.label });
    onSelectView("library");
  }

  return (
    <div className="page-surface min-h-full p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[28px] font-bold m-0">Browse Genres</h1>
      </div>

      {genres.length === 0 ? (
        <EmptyState
          title="Nothing here yet"
          description="Add songs to your library to browse them by genre. You can set a song's genre from the edit dialog."
        />
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {genres.map((genre, idx) => (
            <button
              key={genre.label}
              type="button"
              onClick={() => handleGenreClick(genre)}
              className="group relative h-[160px] rounded-[12px] overflow-hidden cursor-pointer border-none text-left p-0"
              style={{ backgroundColor: GENRE_COLORS[idx % GENRE_COLORS.length] }}
            >
              <Music2
                size={80}
                className="absolute right-[-10px] bottom-[-10px] text-white/20 rotate-12"
              />
              <div className="absolute top-0 left-0 p-4">
                <p className="text-[17px] font-bold text-white m-0 leading-tight">{genre.label}</p>
                <p className="text-[12px] text-white/70 mt-1 mb-0">{genre.count} tracks</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
