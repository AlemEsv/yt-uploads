import React, { useState } from "react";
import { usePlayer } from "../../context/PlayerContext.jsx";

export default function QueuePanel({ onClose }) {
  const { queue, queueIndex, playQueueItem, removeFromQueue, reorderQueue, clearQueue } =
    usePlayer();
  const [dragIndex, setDragIndex] = useState(null);

  return (
    <div className="panel-in-up glass" style={panelStyle}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "0.5rem",
        }}
      >
        <strong>Cola de reproducción</strong>
        <div style={{ display: "flex", gap: "0.4rem" }}>
          <button type="button" onClick={clearQueue} style={smallButton}>
            Vaciar
          </button>
          <button type="button" onClick={onClose} style={smallButton}>
            Cerrar
          </button>
        </div>
      </div>

      {queue.length === 0 ? (
        <p style={{ color: "var(--color-text-secondary)", fontSize: "0.85rem", margin: 0 }}>
          La cola está vacía.
        </p>
      ) : (
        <ul
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            maxHeight: "260px",
            overflowY: "auto",
          }}
        >
          {queue.map((song, index) => (
            <li
              key={`${song.id}-${index}`}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => {
                if (dragIndex !== null && dragIndex !== index) {
                  reorderQueue(dragIndex, index);
                }
                setDragIndex(null);
              }}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0.4rem 0.5rem",
                borderRadius: "6px",
                background: index === queueIndex ? "var(--color-accent)" : "transparent",
                cursor: "grab",
                marginBottom: "0.2rem",
                gap: "0.5rem",
              }}
            >
              <span
                onClick={() => playQueueItem(index)}
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                  flex: 1,
                }}
              >
                {song.titulo}
              </span>
              <button type="button" onClick={() => removeFromQueue(index)} style={smallButton}>
                Quitar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const panelStyle = {
  position: "absolute",
  right: "1rem",
  bottom: "80px",
  width: "280px",
  borderRadius: "10px",
  padding: "0.75rem",
  zIndex: 1200,
};

const smallButton = {
  padding: "0.15rem 0.5rem",
  borderRadius: "6px",
  border: "1px solid var(--color-border)",
  background: "transparent",
  color: "var(--color-text-primary)",
  cursor: "pointer",
  fontSize: "0.7rem",
};
