import React, { useEffect, useMemo, useState } from "react";
import { Clock } from "lucide-react";
import { useApi } from "../hooks/useApi.js";
import { useLibrary } from "../context/LibraryContext.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import MetadataEditModal from "../components/metadata/MetadataEditModal.jsx";
import TrackTable from "../components/tracks/TrackTable.jsx";

function parseUtc(fechaHora) {
  return new Date(`${fechaHora.replace(" ", "T")}Z`);
}

function relativeTime(date) {
  const diffMin = Math.floor((Date.now() - date.getTime()) / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH} hr ago`;
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function dayBucket(date) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday.getTime() - 86400000);
  if (date >= startOfToday) return "Today";
  if (date >= startOfYesterday) return "Yesterday";
  return "Earlier";
}

export default function RecentPage() {
  const api = useApi();
  const { songs, applyUpdate } = useLibrary();
  const [history, setHistory] = useState([]);
  const [editingSong, setEditingSong] = useState(null);

  useEffect(() => {
    if (!api) return;
    api.getHistory(50).then(({ items }) => setHistory(items));
  }, [api]);

  const sections = useMemo(() => {
    const buckets = { Today: [], Yesterday: [], Earlier: [] };
    for (const item of history) {
      const song = songs.find((s) => s.id === item.song_id);
      if (!song) continue;
      const playedAt = parseUtc(item.fecha_hora);
      buckets[dayBucket(playedAt)].push({ key: item.id, song, playedAt: relativeTime(playedAt) });
    }
    return Object.entries(buckets)
      .filter(([, rows]) => rows.length > 0)
      .map(([label, rows]) => ({ label, rows }));
  }, [history, songs]);

  const columns = [
    {
      key: "album",
      header: "ALBUM",
      className: "w-[180px] text-[13px] text-[#9b9b9b] truncate shrink-0",
      render: (song) => song.album ?? "—",
    },
    {
      key: "playedAt",
      header: "PLAYED AT",
      className: "w-[120px] text-[12px] text-[#9b9b9b] shrink-0",
      render: (song, row) => row.playedAt,
    },
  ];

  return (
    <div className="page-surface min-h-full p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[28px] font-bold m-0">Recently Played</h1>
        <div className="flex items-center gap-2 text-[13px] text-[#9b9b9b]">
          <Clock size={14} />
          <span>Play history</span>
        </div>
      </div>

      {sections.length === 0 ? (
        <EmptyState title="Nothing played yet" description="Play a song to see it show up here." />
      ) : (
        sections.map((section) => (
          <div key={section.label} className="mb-6">
            <p className="text-[12px] font-bold tracking-widest text-[#9b9b9b] mb-3 mt-0">
              {section.label.toUpperCase()}
            </p>
            <TrackTable rows={section.rows} columns={columns} onEdit={setEditingSong} />
          </div>
        ))
      )}

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
