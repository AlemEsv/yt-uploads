import React from "react";

export default function Toast({ toast, onDismiss }) {
  const isError = toast.tone === "error";
  const accent = isError ? "var(--color-error)" : "var(--color-success)";

  return (
    <div
      role="alert"
      onClick={() => onDismiss(toast.id)}
      style={{
        background: "#1b1b1b",
        border: `1px solid ${accent}`,
        borderRadius: "10px",
        padding: "0.75rem 1rem",
        minWidth: "260px",
        maxWidth: "320px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
        cursor: "pointer",
      }}
    >
      <strong style={{ color: accent }}>{toast.title}</strong>
      <p
        style={{ margin: "0.25rem 0 0", color: "var(--color-text-secondary)", fontSize: "0.85rem" }}
      >
        {toast.message}
      </p>
    </div>
  );
}
