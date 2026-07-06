import React from "react";
import { useLibrary } from "../../context/LibraryContext.jsx";
import { miniButtonStyle } from "./styles.js";

export default function SongListRow({ song, onEdit }) {
  const { toggleFavorite, removeSong } = useLibrary();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        padding: "0.5rem 1.5rem",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <div style={{ flex: 1, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {song.titulo}
      </div>
      <div
        style={{
          flex: 1,
          color: "var(--color-text-secondary)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {song.artista ?? "Artista desconocido"}
      </div>
      <div style={{ width: "90px", color: "var(--color-text-secondary)", fontSize: "0.8rem" }}>
        {song.plataforma_origen}
      </div>
      <div style={{ display: "flex", gap: "0.35rem" }}>
        <button type="button" onClick={() => toggleFavorite(song)} style={miniButtonStyle(song.es_favorito)}>
          {song.es_favorito ? "En favoritos" : "Favorito"}
        </button>
        <button type="button" onClick={() => onEdit(song)} style={miniButtonStyle(false)}>
          Editar
        </button>
        <button
          type="button"
          onClick={() => window.sounddock.showItemInFolder(song.ruta_archivo)}
          style={miniButtonStyle(false)}
        >
          Carpeta
        </button>
        <button
          type="button"
          onClick={() => {
            if (confirm(`¿Eliminar "${song.titulo}"?`)) removeSong(song.id);
          }}
          style={miniButtonStyle(false)}
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}
