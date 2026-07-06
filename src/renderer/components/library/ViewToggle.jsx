import React from "react";

export default function ViewToggle({ view, onChange }) {
  return (
    <div style={{ display: "flex", gap: "0.25rem" }}>
      {["grid", "list"].map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          style={{
            padding: "0.3rem 0.75rem",
            borderRadius: "6px",
            border: "1px solid var(--color-border)",
            background: view === option ? "var(--color-accent)" : "transparent",
            color: "var(--color-text-primary)",
            cursor: "pointer",
          }}
        >
          {option === "grid" ? "Cuadrícula" : "Lista"}
        </button>
      ))}
    </div>
  );
}
