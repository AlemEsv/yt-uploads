import React, { useState } from "react";
import { useApi } from "../../hooks/useApi.js";
import { useDownloads } from "../../hooks/useDownloads.js";
import { useLibrary } from "../../context/LibraryContext.jsx";
import MetadataEditModal from "../metadata/MetadataEditModal.jsx";

const STATUS_LABEL = {
  queued: "En cola",
  downloading: "Descargando",
  converting: "Convirtiendo",
  completed: "Listo",
  error: "Error",
};

export default function CapturePanel() {
  const api = useApi();
  const { applyUpdate } = useLibrary();
  const [url, setUrl] = useState("");
  const [pendingReview, setPendingReview] = useState(null);
  const { items } = useDownloads({ onNeedsReview: setPendingReview });

  const recentItems = Object.values(items).slice(-5).reverse();

  async function handleSubmit(event) {
    event.preventDefault();
    if (!url.trim() || !api) return;
    try {
      await api.startDownload(url.trim());
      setUrl("");
    } catch {
      // El error real llega por WebSocket (download_error) y se muestra como toast.
    }
  }

  return (
    <div
      style={{
        padding: "0.75rem 1rem",
        borderBottom: "1px solid var(--color-border)",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
      }}
    >
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: "0.5rem" }}>
        <input
          type="text"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="Pega un enlace de YouTube o SoundCloud"
          style={{
            flex: 1,
            padding: "0.5rem 0.75rem",
            borderRadius: "8px",
            border: "1px solid var(--color-border)",
            background: "#0c0c0c",
            color: "var(--color-text-primary)",
          }}
        />
        <button
          type="submit"
          disabled={!url.trim() || !api}
          style={{
            padding: "0.5rem 1.25rem",
            borderRadius: "8px",
            border: "none",
            background: "var(--color-accent)",
            color: "white",
            cursor: url.trim() && api ? "pointer" : "not-allowed",
            opacity: url.trim() && api ? 1 : 0.6,
          }}
        >
          Descargar
        </button>
      </form>

      {recentItems.length > 0 && (
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          {recentItems.map((item) => (
            <li
              key={item.songId}
              style={{
                fontSize: "0.8rem",
                color: "var(--color-text-secondary)",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>{item.cancion?.titulo ?? item.url}</span>
              <span>
                {STATUS_LABEL[item.status] ?? item.status}
                {item.status === "downloading" ? ` ${item.progress ?? 0}%` : ""}
              </span>
            </li>
          ))}
        </ul>
      )}

      {pendingReview && (
        <MetadataEditModal
          cancion={pendingReview}
          onSaved={applyUpdate}
          onClose={() => setPendingReview(null)}
        />
      )}
    </div>
  );
}
