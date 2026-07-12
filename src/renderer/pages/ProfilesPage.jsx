import React, { useState } from "react";
import { useTheme } from "../context/ThemeContext.jsx";

const GENRE_OPTIONS = ["", "electronica", "acustico", "pop", "rock", "lofi", "hiphop"];
const PLATFORM_OPTIONS = ["", "youtube", "soundcloud"];

export default function ProfilesPage() {
  const {
    profiles,
    activeProfileId,
    mode,
    suggestion,
    activateProfile,
    setMoodMode,
    createProfile,
    updateProfile,
    removeProfile,
    dismissSuggestion,
  } = useTheme();
  const [editingProfile, setEditingProfile] = useState(null);

  return (
    <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.75rem",
        }}
      >
        <h2 style={{ margin: 0 }}>Perfiles Temáticos</h2>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <label
            style={{
              fontSize: "0.85rem",
              color: "var(--color-text-secondary)",
              display: "flex",
              gap: "0.4rem",
              alignItems: "center",
            }}
          >
            <input
              type="checkbox"
              checked={mode === "automatico"}
              onChange={(event) => setMoodMode(event.target.checked ? "automatico" : "manual")}
            />
            Modo automático (según hábitos de escucha)
          </label>
          <button type="button" onClick={() => setEditingProfile({})} style={secondaryButton}>
            Nuevo perfil
          </button>
        </div>
      </div>

      {suggestion && mode === "manual" && (
        <div style={suggestionBanner}>
          <span>
            Sugerencia: perfil <strong>{suggestion.nombre}</strong> combina con tus hábitos
            recientes (confianza {Math.round(suggestion.confianza * 100)}%).
          </span>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              type="button"
              onClick={() => activateProfile(suggestion.profile_id)}
              style={secondaryButton}
            >
              Activar
            </button>
            <button type="button" onClick={dismissSuggestion} style={secondaryButton}>
              Descartar
            </button>
          </div>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "1rem",
        }}
      >
        {profiles.map((profile) => (
          <div
            key={profile.id}
            style={{
              border: `1px solid ${profile.id === activeProfileId ? profile.paleta_colores.accent : "var(--color-border)"}`,
              borderRadius: "10px",
              padding: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span
                style={{
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  background: profile.paleta_colores.accent,
                }}
              />
              <strong>{profile.nombre}</strong>
              {profile.id === activeProfileId && (
                <span style={{ fontSize: "0.7rem", color: "var(--color-text-secondary)" }}>
                  (activo)
                </span>
              )}
            </div>
            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => activateProfile(profile.id)}
                disabled={mode === "automatico"}
                style={secondaryButton}
              >
                Activar
              </button>
              <button
                type="button"
                onClick={() => setEditingProfile(profile)}
                style={secondaryButton}
              >
                Editar
              </button>
              {!profile.es_predefinido && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`¿Eliminar el perfil "${profile.nombre}"?`))
                      removeProfile(profile.id);
                  }}
                  style={secondaryButton}
                >
                  Eliminar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {editingProfile && (
        <ProfileEditor
          profile={editingProfile}
          onClose={() => setEditingProfile(null)}
          onSave={async (data) => {
            if (editingProfile.id) {
              await updateProfile(editingProfile.id, data);
            } else {
              await createProfile(data);
            }
            setEditingProfile(null);
          }}
        />
      )}
    </div>
  );
}

function ProfileEditor({ profile, onClose, onSave }) {
  const [nombre, setNombre] = useState(profile.nombre ?? "");
  const [accent, setAccent] = useState(profile.paleta_colores?.accent ?? "#c30dd2");
  const [genero, setGenero] = useState(profile.criterio_activacion?.genero ?? "");
  const [plataforma, setPlataforma] = useState(profile.criterio_activacion?.plataforma ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await onSave({
        nombre,
        paleta_colores: {
          accent,
          accentSoft: hexToRgba(accent, 0.25),
          background: "#000101",
          sidebarBackground: "#131212",
        },
        criterio_activacion:
          genero || plataforma ? { genero: genero || null, plataforma: plataforma || null } : null,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={modalOverlay}>
      <div style={modalBox}>
        <h3 style={{ margin: 0 }}>{profile.id ? "Editar perfil" : "Nuevo perfil"}</h3>
        <label style={labelStyle}>
          Nombre
          <input
            value={nombre}
            onChange={(event) => setNombre(event.target.value)}
            style={inputStyle}
          />
        </label>
        <label style={labelStyle}>
          Color de acento
          <input
            type="color"
            value={accent}
            onChange={(event) => setAccent(event.target.value)}
            style={{ ...inputStyle, height: "36px", padding: "0.2rem" }}
          />
        </label>
        <label style={labelStyle}>
          Género que activa este perfil (opcional)
          <select
            value={genero}
            onChange={(event) => setGenero(event.target.value)}
            style={inputStyle}
          >
            {GENRE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option || "(ninguno)"}
              </option>
            ))}
          </select>
        </label>
        <label style={labelStyle}>
          Plataforma que activa este perfil (opcional)
          <select
            value={plataforma}
            onChange={(event) => setPlataforma(event.target.value)}
            style={inputStyle}
          >
            {PLATFORM_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option || "(ninguna)"}
              </option>
            ))}
          </select>
        </label>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "0.5rem",
            marginTop: "0.5rem",
          }}
        >
          <button type="button" onClick={onClose} style={secondaryButton}>
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !nombre.trim()}
            style={primaryButton}
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function hexToRgba(hex, alpha) {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const secondaryButton = {
  padding: "0.35rem 0.8rem",
  borderRadius: "8px",
  border: "1px solid var(--color-border)",
  background: "transparent",
  color: "var(--color-text-primary)",
  cursor: "pointer",
  fontSize: "0.8rem",
};

const primaryButton = {
  padding: "0.4rem 1rem",
  borderRadius: "8px",
  border: "none",
  background: "var(--color-accent)",
  color: "white",
  cursor: "pointer",
};

const modalOverlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0, 0, 0, 0.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 2000,
};

const modalBox = {
  background: "#131212",
  border: "1px solid var(--color-border)",
  borderRadius: "12px",
  padding: "1.5rem",
  width: "360px",
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
};

const labelStyle = {
  fontSize: "0.8rem",
  color: "var(--color-text-secondary)",
  display: "flex",
  flexDirection: "column",
  gap: "0.25rem",
};

const inputStyle = {
  padding: "0.4rem 0.6rem",
  borderRadius: "6px",
  border: "1px solid var(--color-border)",
  background: "#0c0c0c",
  color: "var(--color-text-primary)",
};

const suggestionBanner = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "1rem",
  padding: "0.6rem 1rem",
  borderRadius: "8px",
  border: "1px solid var(--color-accent)",
  background: "var(--color-accent-soft)",
  fontSize: "0.85rem",
};
