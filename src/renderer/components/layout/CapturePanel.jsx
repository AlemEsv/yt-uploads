import React, { useState } from "react";
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
  const { applyUpdate } = useLibrary();
  const [pendingReview, setPendingReview] = useState(null);
  const { items } = useDownloads({ onNeedsReview: setPendingReview });

  const recentItems = Object.values(items)
    .filter((item) => item.status !== "completed")
    .slice(-5)
    .reverse();

  if (recentItems.length === 0 && !pendingReview) {
    return null;
  }

  return (
    <div
      style={{
        position: "absolute",
        top: "100%",
        left: "1.25rem",
        marginTop: "0.5rem",
        width: "340px",
        padding: "0.75rem",
        borderRadius: "12px",
        border: "1px solid var(--color-border)",
        background: "var(--color-sidebar-bg)",
        boxShadow: "0 12px 32px rgba(0,0,0,0.5)",
        zIndex: 1500,
      }}
    >
      {recentItems.length > 0 && (
        <ul
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            display: "flex",
            flexDirection: "column",
            gap: "0.4rem",
          }}
        >
          {recentItems.map((item) => (
            <li
              key={item.songId}
              style={{
                fontSize: "0.8rem",
                color: "var(--color-text-secondary)",
                display: "flex",
                justifyContent: "space-between",
                gap: "0.5rem",
              }}
            >
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {item.cancion?.titulo ?? item.url}
              </span>
              <span style={{ flexShrink: 0 }}>
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
