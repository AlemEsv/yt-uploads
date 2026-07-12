import React, { useMemo, useState } from "react";
import { useLibrary } from "../context/LibraryContext.jsx";
import SongGrid from "../components/library/SongGrid.jsx";
import SongListView from "../components/library/SongListView.jsx";
import ViewToggle from "../components/library/ViewToggle.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import MetadataEditModal from "../components/metadata/MetadataEditModal.jsx";

export default function FavoritesPage() {
  const { songs, applyUpdate, searchQuery } = useLibrary();
  const [view, setView] = useState(() => localStorage.getItem("sounddock:favoritesView") ?? "grid");
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

  function handleViewChange(next) {
    setView(next);
    localStorage.setItem("sounddock:favoritesView", next);
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1rem 1.5rem 0",
        }}
      >
        <h2 style={{ margin: 0 }}>Favoritos</h2>
        <ViewToggle view={view} onChange={handleViewChange} />
      </div>

      {favoritos.length === 0 ? (
        <EmptyState
          title="Aún no tienes favoritos"
          description="Toca el corazón en cualquier canción de tu biblioteca para agregarla aquí."
        />
      ) : view === "grid" ? (
        <SongGrid songs={favoritos} onEdit={setEditingSong} />
      ) : (
        <SongListView songs={favoritos} onEdit={setEditingSong} />
      )}

      {editingSong && (
        <MetadataEditModal
          cancion={editingSong}
          onSaved={applyUpdate}
          onClose={() => setEditingSong(null)}
        />
      )}
    </div>
  );
}
