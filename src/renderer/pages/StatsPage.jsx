import React, { useEffect, useMemo, useState } from "react";
import { BarChart3, Disc3, Play, Radio } from "lucide-react";
import { useApi } from "../hooks/useApi.js";
import { useLibrary } from "../context/LibraryContext.jsx";
import EmptyState from "../components/common/EmptyState.jsx";

const WINDOWS = [
  { days: 7, label: "Last 7 days" },
  { days: 30, label: "Last 30 days" },
];

function BarList({ title, items, max }) {
  return (
    <div className="glass rounded-[15px] p-5">
      <h3 className="text-[16px] font-bold mb-4 mt-0">{title}</h3>
      {items.length === 0 ? (
        <p className="text-[13px] text-[var(--color-muted-text)] m-0">No data yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <span className="w-[120px] text-[13px] truncate">{item.label}</span>
              <div className="flex-1 h-[8px] bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-500"
                  style={{ width: `${Math.round((item.count / max) * 100)}%` }}
                />
              </div>
              <span className="w-8 text-right text-[12px] text-[var(--color-muted-text)]">
                {item.count}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function StatsPage() {
  const api = useApi();
  const { songs } = useLibrary();
  const [windowDays, setWindowDays] = useState(7);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!api) return;
    api.getHistoryStats(windowDays).then(setStats);
  }, [api, windowDays]);

  const topSongs = useMemo(() => {
    if (!stats) return [];
    return stats.top_canciones.slice(0, 5).map((tc) => ({
      ...tc,
      song: songs.find((s) => s.id === tc.song_id) ?? null,
    }));
  }, [stats, songs]);

  const topGenre = stats?.top_generos[0]?.genero ?? "—";
  const topPlatform = stats?.top_plataformas[0]?.plataforma ?? "—";

  const tiles = [
    { icon: Play, label: "Total plays", value: stats ? stats.total_reproducciones : "…" },
    { icon: Disc3, label: "Top genre", value: topGenre },
    { icon: Radio, label: "Top platform", value: topPlatform },
  ];

  return (
    <div className="page-surface min-h-full p-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-[28px] font-bold m-0">Statistics</h1>
        <div className="flex gap-2">
          {WINDOWS.map((w) => (
            <button
              key={w.days}
              type="button"
              onClick={() => setWindowDays(w.days)}
              className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors border-none cursor-pointer ${
                windowDays === w.days
                  ? "bg-[var(--color-accent)] text-white"
                  : "glass text-[var(--color-muted-text)] hover:text-white hover:bg-white/10"
              }`}
            >
              {w.label}
            </button>
          ))}
        </div>
      </div>

      {stats && stats.total_reproducciones === 0 ? (
        <EmptyState
          title="No listening data yet"
          description="Play some songs and your listening stats will show up here."
        />
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {tiles.map(({ icon: Icon, label, value }) => (
              <div key={label} className="glass rounded-[12px] p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-[8px] flex items-center justify-center bg-[var(--color-accent-soft)]">
                  <Icon size={18} className="text-[var(--color-accent)]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] text-[var(--color-muted-text)] m-0">{label}</p>
                  <p className="text-[20px] font-bold m-0 truncate">{value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="glass rounded-[15px] p-5 mb-6">
            <h3 className="text-[16px] font-bold mb-4 mt-0 flex items-center gap-2">
              <BarChart3 size={16} className="text-[var(--color-accent)]" />
              Most played
            </h3>
            {topSongs.length === 0 ? (
              <p className="text-[13px] text-[var(--color-muted-text)] m-0">
                No plays in this period.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {topSongs.map((entry, idx) => (
                  <div key={entry.song_id} className="flex items-center gap-4 py-1.5">
                    <span className="w-5 text-center text-[15px] font-bold">{idx + 1}</span>
                    {entry.song && api ? (
                      <img
                        src={api.coverUrl(entry.song.id, entry.song.fecha_modificacion)}
                        alt=""
                        className="w-[40px] h-[40px] rounded-[4px] object-cover bg-[var(--color-cover-placeholder-bg)] shrink-0"
                      />
                    ) : (
                      <div className="w-[40px] h-[40px] rounded-[4px] bg-[var(--color-cover-placeholder-bg)] shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold truncate m-0">{entry.titulo}</p>
                      <p className="text-[12px] text-[var(--color-text-secondary)] truncate m-0">
                        {entry.artista ?? "Unknown artist"}
                      </p>
                    </div>
                    <span className="text-[12px] text-[var(--color-muted-text)] shrink-0">
                      {entry.reproducciones} plays
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <BarList
              title="Genres"
              items={(stats?.top_generos ?? []).map((g) => ({
                label: g.genero,
                count: g.reproducciones,
              }))}
              max={Math.max(...(stats?.top_generos ?? []).map((g) => g.reproducciones), 1)}
            />
            <BarList
              title="Platforms"
              items={(stats?.top_plataformas ?? []).map((p) => ({
                label: p.plataforma,
                count: p.reproducciones,
              }))}
              max={Math.max(...(stats?.top_plataformas ?? []).map((p) => p.reproducciones), 1)}
            />
          </div>
        </>
      )}
    </div>
  );
}
