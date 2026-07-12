import React, { useEffect, useMemo, useState } from "react";
import { Clock3, Folder, Heart, Music, RefreshCw, Upload } from "lucide-react";
import { useApi } from "../hooks/useApi.js";
import { useLibrary } from "../context/LibraryContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import DropZoneOverlay from "../components/import/DropZoneOverlay.jsx";
import MetadataEditModal from "../components/metadata/MetadataEditModal.jsx";
import TrackTable from "../components/tracks/TrackTable.jsx";

const PLATFORM_BADGES = {
  youtube: { label: "YOUTUBE", color: "#C71B1B" },
  soundcloud: { label: "SOUNDCLOUD", color: "#E8720C" },
  importado: { label: "IMPORTED", color: "#35827D" },
};

function formatTotalDuration(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.round((totalSeconds % 3600) / 60);
  return hours > 0 ? `${hours} h ${minutes} min` : `${minutes} min`;
}

export default function LibraryPage() {
  const api = useApi();
  const {
    songs,
    loading,
    importFiles,
    scanLibrary,
    applyUpdate,
    searchQuery,
    platformFilter,
    setPlatformFilter,
    genreFilter,
    setGenreFilter,
  } = useLibrary();
  const { showSuccess, showError } = useToast();
  const [editingSong, setEditingSong] = useState(null);
  const [downloadDir, setDownloadDir] = useState(null);

  useEffect(() => {
    if (!api) return;
    api.getSettings().then((settings) => setDownloadDir(settings.directorio_descarga ?? null));
  }, [api]);

  const filteredSongs = useMemo(() => {
    let result = songs;
    if (platformFilter) {
      result = result.filter((song) => song.plataforma_origen === platformFilter);
    }
    if (genreFilter) {
      result = result.filter((song) => (song.genero ?? null) === genreFilter.value);
    }
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (song) =>
          song.titulo.toLowerCase().includes(q) ||
          (song.artista ?? "").toLowerCase().includes(q) ||
          (song.album ?? "").toLowerCase().includes(q),
      );
    }
    return result;
  }, [songs, searchQuery, platformFilter, genreFilter]);

  const totalDuration = useMemo(
    () => songs.reduce((acc, s) => acc + (s.duracion_segundos ?? 0), 0),
    [songs],
  );
  const likedCount = useMemo(() => songs.filter((s) => s.es_favorito).length, [songs]);

  async function handleImportPaths(paths) {
    try {
      const result = await importFiles(paths);
      showSuccess({
        title: "Import complete",
        message: `${result.importadas} new, ${result.actualizadas} updated${
          result.errores.length ? `, ${result.errores.length} failed` : ""
        }.`,
      });
    } catch {
      showError({ title: "Import failed", message: "The selected files could not be imported." });
    }
  }

  async function handleChooseFiles() {
    const paths = await window.sounddock.chooseMp3Files();
    if (paths.length > 0) {
      handleImportPaths(paths);
    }
  }

  async function handleScan() {
    try {
      await scanLibrary();
      showSuccess({
        title: "Scan complete",
        message: "Your library is in sync with the configured folder.",
      });
    } catch {
      showError({ title: "Scan failed", message: "The library scan could not be completed." });
    }
  }

  const columns = [
    {
      key: "album",
      header: "ALBUM",
      className: "w-[160px] text-[13px] text-[#9b9b9b] truncate shrink-0",
      render: (song) => song.album ?? "—",
    },
    {
      key: "platform",
      header: "SOURCE",
      className: "w-[100px] flex justify-center shrink-0",
      render: (song) => {
        const badge = PLATFORM_BADGES[song.plataforma_origen];
        return (
          <span
            className="text-[9px] font-bold px-2 py-0.5 rounded-[4px] text-white"
            style={{ backgroundColor: badge?.color ?? "#414141" }}
          >
            {badge?.label ?? song.plataforma_origen}
          </span>
        );
      },
    },
    {
      key: "bitrate",
      header: "BITRATE",
      className: "w-[70px] text-right text-[12px] text-[#9b9b9b] shrink-0",
      render: (song) => (song.calidad_kbps ? `${song.calidad_kbps}kbps` : "—"),
    },
  ];

  const stats = [
    { icon: Music, label: "Total Songs", value: songs.length.toLocaleString() },
    { icon: Clock3, label: "Total Duration", value: formatTotalDuration(totalDuration) },
    { icon: Heart, label: "Liked", value: likedCount.toLocaleString() },
  ];

  const activeFilter = platformFilter || genreFilter;

  return (
    <div className="page-surface min-h-full p-6">
      <DropZoneOverlay onDropFiles={handleImportPaths} />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[28px] font-bold m-0">Local Files</h1>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleScan}
            className="flex items-center gap-2 glass hover:bg-white/10 text-[13px] text-[#9b9b9b] hover:text-white px-4 py-2 rounded-[8px] transition-colors border-none cursor-pointer"
          >
            <RefreshCw size={13} /> Scan Library
          </button>
          <button
            type="button"
            onClick={handleChooseFiles}
            className="flex items-center gap-2 bg-[var(--color-accent)] hover:opacity-90 text-white text-[13px] font-semibold px-4 py-2 rounded-[8px] transition-colors border-none cursor-pointer"
          >
            <Upload size={13} /> Add Files
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {stats.map(({ icon: Icon, label, value }) => (
          <div key={label} className="glass rounded-[12px] p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-[8px] flex items-center justify-center bg-[var(--color-accent-soft)]">
              <Icon size={18} className="text-[var(--color-accent)]" />
            </div>
            <div>
              <p className="text-[12px] text-[#9b9b9b] m-0">{label}</p>
              <p className="text-[20px] font-bold m-0">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Source folder */}
      {downloadDir && (
        <div className="glass rounded-[15px] p-5 mb-6">
          <h2 className="text-[16px] font-bold mb-4 mt-0">Source Folder</h2>
          <div className="flex items-center gap-4 p-3 rounded-[10px] hover:bg-white/5 transition-colors">
            <div className="w-9 h-9 rounded-[8px] flex items-center justify-center shrink-0 bg-[var(--color-accent-soft)]">
              <Folder size={16} className="text-[var(--color-accent)]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold m-0">Downloads</p>
              <p className="text-[11px] text-[#9b9b9b] truncate m-0">{downloadDir}</p>
            </div>
            <span className="text-[12px] text-[#9b9b9b]">{songs.length} files</span>
          </div>
        </div>
      )}

      {/* Files list */}
      {activeFilter && (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[12px] text-[#9b9b9b]">
            Filtering by {platformFilter ?? genreFilter?.label}
          </span>
          <button
            type="button"
            onClick={() => {
              setPlatformFilter(null);
              setGenreFilter(null);
            }}
            className="text-[12px] text-[var(--color-accent)] bg-transparent border-none cursor-pointer p-0 hover:underline"
          >
            Clear filter
          </button>
        </div>
      )}

      {loading ? (
        <p className="text-[13px] text-[#9b9b9b]">Loading library...</p>
      ) : filteredSongs.length === 0 ? (
        <EmptyState
          title={songs.length === 0 ? "Your library is empty" : "No results"}
          description={
            songs.length === 0
              ? "Download from a link up top, or import MP3 files you already have."
              : "No songs match your search or filter."
          }
          actionLabel={songs.length === 0 ? "Add Files" : undefined}
          onAction={songs.length === 0 ? handleChooseFiles : undefined}
        />
      ) : (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[16px] font-bold m-0">All Files</h2>
            <span className="text-[12px] text-[#9b9b9b]">
              {filteredSongs.length} of {songs.length} shown
            </span>
          </div>
          <TrackTable
            rows={filteredSongs.map((song) => ({ song }))}
            columns={columns}
            onEdit={setEditingSong}
          />
        </div>
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
