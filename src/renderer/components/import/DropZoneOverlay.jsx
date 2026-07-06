import React, { useEffect, useState } from "react";

export default function DropZoneOverlay({ onDropFiles }) {
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    function handleDragOver(event) {
      event.preventDefault();
      setIsDragging(true);
    }

    function handleDragLeave(event) {
      if (!event.relatedTarget) {
        setIsDragging(false);
      }
    }

    function handleDrop(event) {
      event.preventDefault();
      setIsDragging(false);
      const files = Array.from(event.dataTransfer?.files ?? []);
      const paths = files
        .map((file) => window.sounddock.getPathForFile(file))
        .filter((path) => path.toLowerCase().endsWith(".mp3"));
      if (paths.length > 0) {
        onDropFiles(paths);
      }
    }

    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("drop", handleDrop);
    return () => {
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("drop", handleDrop);
    };
  }, [onDropFiles]);

  if (!isDragging) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(108, 92, 231, 0.15)",
        border: "2px dashed var(--color-accent)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1500,
        pointerEvents: "none",
      }}
    >
      <span style={{ fontSize: "1.1rem", fontWeight: 600 }}>Suelta los archivos MP3 para importarlos</span>
    </div>
  );
}
