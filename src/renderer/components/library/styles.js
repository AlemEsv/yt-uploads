export function miniButtonStyle(active) {
  return {
    padding: "0.15rem 0.4rem",
    borderRadius: "6px",
    border: "1px solid var(--color-border)",
    background: active ? "var(--color-accent)" : "transparent",
    color: "var(--color-text-primary)",
    cursor: "pointer",
    fontSize: "0.75rem",
  };
}
