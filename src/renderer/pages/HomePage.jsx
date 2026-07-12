import React, { useEffect, useMemo, useState } from "react";
import { useApi } from "../hooks/useApi.js";
import { useLibrary } from "../context/LibraryContext.jsx";
import MetadataEditModal from "../components/metadata/MetadataEditModal.jsx";
import HeroBanner from "../components/home/HeroBanner.jsx";
import RecentlyPlayedRow from "../components/home/RecentlyPlayedRow.jsx";
import PlatformChipGrid from "../components/home/PlatformChipGrid.jsx";
import TopTracksList from "../components/home/TopTracksList.jsx";

export default function HomePage({ onSelectView }) {
  const api = useApi();
  const { songs, applyUpdate } = useLibrary();
  const [history, setHistory] = useState([]);
  const [topCanciones, setTopCanciones] = useState([]);
  const [editingSong, setEditingSong] = useState(null);

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
      if (result.length >= 8) break;
    }
    return result;
  }, [history, songs]);

  return (
    <div
      style={{ padding: "1rem 1.5rem", display: "flex", flexDirection: "column", gap: "1.75rem" }}
    >
      <HeroBanner topCanciones={topCanciones} />
      <RecentlyPlayedRow songs={recentSongs} />
      <div style={{ display: "grid", gridTemplateColumns: "254px 1fr", gap: "1.25rem" }}>
        <PlatformChipGrid onSelectView={onSelectView} />
        <TopTracksList topCanciones={topCanciones} onEdit={setEditingSong} />
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
