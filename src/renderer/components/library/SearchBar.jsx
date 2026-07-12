import React from "react";

export default function SearchBar({
  value,
  onChange,
  placeholder = "Buscar por título o artista",
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      style={{
        padding: "0.4rem 0.75rem",
        borderRadius: "8px",
        border: "1px solid var(--color-border)",
        background: "#0c0c0c",
        color: "var(--color-text-primary)",
        minWidth: "220px",
      }}
    />
  );
}
