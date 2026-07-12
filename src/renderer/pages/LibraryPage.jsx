import React, { useMemo, useState } from "react";
import { useLibrary } from "../context/LibraryContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import SongGrid from "../components/library/SongGrid.jsx";
import SongListView from "../components/library/SongListView.jsx";
import ViewToggle from "../components/library/ViewToggle.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import SkeletonCard from "../components/common/SkeletonCard.jsx";
import DropZoneOverlay from "../components/import/DropZoneOverlay.jsx";
import MetadataEditModal from "../components/metadata/MetadataEditModal.jsx";

export default function LibraryPage() {
  const { songs, loading, importFiles, scanLibrary, applyUpdate, searchQuery, platformFilter } =
    useLibrary();
  const { showSuccess, showError } = useToast();
  const [view, setView] = useState(() => localStorage.getItem("sounddock:libraryView") ?? "grid");
  const [editingSong, setEditingSong] = useState(null);

  function handleViewChange(next) {
    setView(next);
    localStorage.setItem("sounddock:libraryView", next);
  }

  const filteredSongs = useMemo(() => {
    let result = songs;
    if (platformFilter) {
      result = result.filter((song) => song.plataforma_origen === platformFilter);
    }
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (song) =>
          song.titulo.toLowerCase().includes(q) || (song.artista ?? "").toLowerCase().includes(q),
      );
    }
    return result;
  }, [songs, searchQuery, platformFilter]);

  async function handleImportPaths(paths) {
    try {
      const result = await importFiles(paths);
      showSuccess({
        title: "Importación completa",
        message: `${result.importadas} nuevas, ${result.actualizadas} actualizadas${
          result.errores.length ? `, ${result.errores.length} con error` : ""
        }.`,
      });
    } catch {
      showError({
        title: "Error al importar",
        message: "No se pudieron importar los archivos seleccionados.",
      });
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
        title: "Escaneo completo",
        message: "La biblioteca se sincronizó con la carpeta configurada.",
      });
    } catch {
      showError({
        title: "Error al escanear",
        message: "No se pudo completar el escaneo de la biblioteca.",
      });
    }
  }

  return (
    <div>
      <DropZoneOverlay onDropFiles={handleImportPaths} />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1rem 1.5rem 0",
          gap: "0.75rem",
          flexWrap: "wrap",
        }}
      >
        <h2 style={{ margin: 0 }}>Local</h2>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
          <ViewToggle view={view} onChange={handleViewChange} />
          <button type="button" onClick={handleChooseFiles} style={secondaryButton}>
            Importar archivos
          </button>
          <button type="button" onClick={handleScan} style={secondaryButton}>
            Escanear carpeta
          </button>
        </div>
      </div>

      {loading ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
            gap: "1rem",
            padding: "1rem 1.5rem",
          }}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filteredSongs.length === 0 ? (
        <EmptyState
          title={songs.length === 0 ? "Tu biblioteca está vacía" : "Sin resultados"}
          description={
            songs.length === 0
              ? "Pega un enlace de YouTube o SoundCloud arriba, o importa archivos MP3 que ya tengas."
              : "No hay canciones que coincidan con tu búsqueda."
          }
          actionLabel={songs.length === 0 ? "Importar archivos" : undefined}
          onAction={songs.length === 0 ? handleChooseFiles : undefined}
        />
      ) : view === "grid" ? (
        <SongGrid songs={filteredSongs} onEdit={setEditingSong} />
      ) : (
        <SongListView songs={filteredSongs} onEdit={setEditingSong} />
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

const secondaryButton = {
  padding: "0.4rem 0.9rem",
  borderRadius: "8px",
  border: "1px solid var(--color-border)",
  background: "transparent",
  color: "var(--color-text-primary)",
  cursor: "pointer",
};
