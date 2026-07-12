import React, { useEffect, useRef } from "react";
import { useLibrary } from "../../context/LibraryContext.jsx";

export default function TrackRowMenu({ song, onEdit, onClose }) {
  const { removeSong } = useLibrary();
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      style={{
        position: "absolute",
        top: "100%",
        right: 0,
        marginTop: "0.25rem",
        background: "var(--color-sidebar-bg)",
        border: "1px solid var(--color-border)",
        borderRadius: "8px",
        minWidth: "160px",
        overflow: "hidden",
        zIndex: 1000,
      }}
    >
      {onEdit && (
        <button
          type="button"
          onClick={() => {
            onEdit(song);
            onClose();
          }}
          style={itemStyle}
        >
          Editar
        </button>
      )}
      <button
        type="button"
        onClick={() => {
          window.sounddock.showItemInFolder(song.ruta_archivo);
          onClose();
        }}
        style={itemStyle}
      >
        Carpeta
      </button>
      <button
        type="button"
        onClick={() => {
          if (confirm(`¿Eliminar "${song.titulo}" de la biblioteca?`)) removeSong(song.id);
          onClose();
        }}
        style={itemStyle}
      >
        Eliminar
      </button>
    </div>
  );
}

const itemStyle = {
  display: "block",
  width: "100%",
  textAlign: "left",
  padding: "0.5rem 0.75rem",
  border: "none",
  background: "transparent",
  color: "var(--color-text-primary)",
  cursor: "pointer",
  font: "inherit",
  fontSize: "0.85rem",
};
