import React from "react";

const NAV_ITEMS = [
  { id: "library", label: "Tu Biblioteca" },
  { id: "favorites", label: "Favoritos" },
  { id: "profiles", label: "Perfiles Temáticos" },
  { id: "stats", label: "Estadísticas" },
  { id: "settings", label: "Configuración" },
];

export default function Sidebar({ activeView, onSelectView }) {
  return (
    <nav
      style={{
        background: "var(--color-sidebar-bg)",
        borderRadius: "12px",
        margin: "0.75rem",
        padding: "1rem 0.75rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.25rem",
        width: "190px",
        flexShrink: 0,
        border: "1px solid var(--color-border)",
      }}
    >
      <div style={{ fontWeight: 700, padding: "0 0.5rem 1rem" }}>SoundDock</div>
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelectView(item.id)}
          style={{
            textAlign: "left",
            padding: "0.5rem 0.75rem",
            borderRadius: "8px",
            border: "none",
            background: activeView === item.id ? "var(--color-accent)" : "transparent",
            color: "var(--color-text-primary)",
            cursor: "pointer",
            font: "inherit",
          }}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}
