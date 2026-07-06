import React, { useState } from "react";
import { useApi } from "../../hooks/useApi.js";

export default function MetadataEditModal({ cancion, onClose, onSaved }) {
  const api = useApi();
  const [titulo, setTitulo] = useState(cancion.titulo ?? "");
  const [artista, setArtista] = useState(cancion.artista ?? "");
  const [genero, setGenero] = useState(cancion.genero ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!api) return;
    setSaving(true);
    try {
      const updated = await api.patchLibrarySong(cancion.id, { titulo, artista, genero: genero || null });
      onSaved?.(updated);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
      }}
    >
      <div
        style={{
          background: "#131212",
          border: "1px solid var(--color-border)",
          borderRadius: "12px",
          padding: "1.5rem",
          width: "360px",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "1.1rem" }}>Revisar metadatos</h2>
        <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>
          No pudimos detectar toda la información de esta descarga. Corrígela antes de guardarla
          definitivamente.
        </p>

        <label style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>
          Título
          <input value={titulo} onChange={(e) => setTitulo(e.target.value)} style={inputStyle} />
        </label>

        <label style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>
          Artista
          <input value={artista} onChange={(e) => setArtista(e.target.value)} style={inputStyle} />
        </label>

        <label style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>
          Género (opcional)
          <input value={genero} onChange={(e) => setGenero(e.target.value)} style={inputStyle} />
        </label>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "0.5rem" }}>
          <button type="button" onClick={onClose} style={secondaryButtonStyle}>
            Cerrar
          </button>
          <button type="button" onClick={handleSave} disabled={saving} style={primaryButtonStyle}>
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  display: "block",
  width: "100%",
  marginTop: "0.25rem",
  padding: "0.4rem 0.6rem",
  borderRadius: "6px",
  border: "1px solid var(--color-border)",
  background: "#0c0c0c",
  color: "var(--color-text-primary)",
};

const primaryButtonStyle = {
  padding: "0.4rem 1rem",
  borderRadius: "8px",
  border: "none",
  background: "var(--color-accent)",
  color: "white",
  cursor: "pointer",
};

const secondaryButtonStyle = {
  padding: "0.4rem 1rem",
  borderRadius: "8px",
  border: "1px solid var(--color-border)",
  background: "transparent",
  color: "var(--color-text-primary)",
  cursor: "pointer",
};
