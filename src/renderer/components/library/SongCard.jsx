import React, { useState } from "react";
import { useApi } from "../../hooks/useApi.js";
import { useLibrary } from "../../context/LibraryContext.jsx";
import { miniButtonStyle } from "./styles.js";

export default function SongCard({ song, onEdit }) {
  const api = useApi();
  const { toggleFavorite, removeSong } = useLibrary();
  const [imgError, setImgError] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
      <div style={{ aspectRatio: "1 / 1", borderRadius: "10px", background: "#161616", overflow: "hidden" }}>
        {!imgError && api && (
          <img
            src={api.coverUrl(song.id)}
            alt=""
            onError={() => setImgError(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        )}
      </div>
      <div
        style={{
          fontWeight: 700,
          fontSize: "0.9rem",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {song.titulo}
      </div>
      <div
        style={{
          color: "var(--color-text-secondary)",
          fontSize: "0.8rem",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {song.artista ?? "Artista desconocido"}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", fontSize: "0.75rem" }}>
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
            if (confirm(`¿Eliminar "${song.titulo}" de la biblioteca?`)) removeSong(song.id);
          }}
          style={miniButtonStyle(false)}
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}
