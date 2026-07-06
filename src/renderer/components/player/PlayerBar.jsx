import React from "react";

// Barra estática por ahora — la reproducción real llega en feature/player.
export default function PlayerBar() {
  return (
    <div
      style={{
        height: "76px",
        flexShrink: 0,
        borderTop: "1px solid var(--color-border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--color-text-secondary)",
        fontSize: "0.85rem",
      }}
    >
      El reproductor se habilita en una próxima rama (feature/player)
    </div>
  );
}
