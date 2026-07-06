import React from "react";

export default function EmptyState({ title, description, actionLabel, onAction }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
        padding: "3rem 1.5rem",
        textAlign: "center",
        color: "var(--color-text-secondary)",
      }}
    >
      <h3 style={{ margin: 0, color: "var(--color-text-primary)" }}>{title}</h3>
      <p style={{ margin: 0, maxWidth: "360px" }}>{description}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          style={{
            marginTop: "0.5rem",
            padding: "0.5rem 1.25rem",
            borderRadius: "8px",
            border: "none",
            background: "var(--color-accent)",
            color: "white",
            cursor: "pointer",
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
