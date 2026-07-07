import React, { useEffect, useState } from "react";
import { useApi } from "../hooks/useApi.js";
import { useToast } from "../context/ToastContext.jsx";
import { useLibrary } from "../context/LibraryContext.jsx";
import OnboardingLegalPage from "./OnboardingLegalPage.jsx";

export default function SettingsPage() {
  const api = useApi();
  const { showSuccess, showError } = useToast();
  const { scanLibrary, refetch } = useLibrary();
  const [settings, setSettings] = useState(null);
  const [showLegal, setShowLegal] = useState(false);

  useEffect(() => {
    if (!api) return;
    api.getSettings().then(setSettings);
  }, [api]);

  async function updateSetting(patch) {
    const updated = await api.putSettings(patch);
    setSettings(updated);
  }

  async function handleChooseFolder() {
    const folder = await window.sounddock.chooseFolder();
    if (folder) {
      await updateSetting({ directorio_descarga: folder });
    }
  }

  async function handleExport() {
    const destino = await window.sounddock.chooseBackupExportPath();
    if (!destino) return;
    try {
      const result = await api.exportBackup(destino);
      showSuccess({ title: "Respaldo exportado", message: `Guardado en ${result.exportado_a}` });
    } catch {
      showError({ title: "Error al exportar", message: "No se pudo crear el archivo de respaldo." });
    }
  }

  async function handleImport() {
    const origen = await window.sounddock.chooseBackupImportPath();
    if (!origen) return;
    if (!confirm("Esto reemplazará tu biblioteca actual con el contenido del respaldo. ¿Continuar?")) return;
    try {
      const result = await api.importBackup(origen);
      showSuccess({
        title: "Respaldo restaurado",
        message: `${result.canciones_totales} canciones en el catálogo restaurado.`,
      });
      await refetch();
    } catch {
      showError({ title: "Error al restaurar", message: "No se pudo restaurar el respaldo seleccionado." });
    }
  }

  async function handleScan() {
    try {
      await scanLibrary();
      showSuccess({ title: "Escaneo completo", message: "La biblioteca se sincronizó con la carpeta configurada." });
    } catch {
      showError({ title: "Error al escanear", message: "No se pudo completar el escaneo." });
    }
  }

  if (!settings) {
    return <div style={{ padding: "1.5rem", color: "var(--color-text-secondary)" }}>Cargando configuración...</div>;
  }

  return (
    <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: "560px" }}>
      <h2 style={{ margin: 0 }}>Configuración</h2>

      <section style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Audio</h3>
        <label style={labelStyle}>
          Calidad de descarga
          <select
            value={settings.calidad_audio_kbps}
            onChange={(event) => updateSetting({ calidad_audio_kbps: Number(event.target.value) })}
            style={inputStyle}
          >
            <option value={320}>320 kbps</option>
            <option value={192}>192 kbps</option>
          </select>
        </label>
      </section>

      <section style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Biblioteca</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>Carpeta de descarga</span>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {settings.directorio_descarga}
            </span>
            <button type="button" onClick={handleChooseFolder} style={secondaryButton}>
              Cambiar
            </button>
          </div>
        </div>
        <button type="button" onClick={handleScan} style={{ ...secondaryButton, alignSelf: "flex-start" }}>
          Escanear carpeta ahora
        </button>
      </section>

      <section style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Respaldo</h3>
        <p style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", margin: 0 }}>
          El respaldo incluye tu catálogo, historial, favoritos, perfiles y configuración — no copia los archivos MP3.
        </p>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button type="button" onClick={handleExport} style={secondaryButton}>
            Exportar respaldo
          </button>
          <button type="button" onClick={handleImport} style={secondaryButton}>
            Restaurar respaldo
          </button>
        </div>
      </section>

      <section style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Acerca de</h3>
        <button type="button" onClick={() => setShowLegal(true)} style={{ ...secondaryButton, alignSelf: "flex-start" }}>
          Ver nota legal
        </button>
      </section>

      {showLegal && <OnboardingLegalPage mode="about" onClose={() => setShowLegal(false)} />}
    </div>
  );
}

const sectionStyle = { display: "flex", flexDirection: "column", gap: "0.6rem" };
const sectionTitleStyle = { fontSize: "0.9rem", color: "var(--color-text-secondary)", margin: 0 };
const labelStyle = {
  fontSize: "0.8rem",
  color: "var(--color-text-secondary)",
  display: "flex",
  flexDirection: "column",
  gap: "0.25rem",
  maxWidth: "220px",
};
const inputStyle = {
  padding: "0.4rem 0.6rem",
  borderRadius: "6px",
  border: "1px solid var(--color-border)",
  background: "#0c0c0c",
  color: "var(--color-text-primary)",
};
const secondaryButton = {
  padding: "0.4rem 0.9rem",
  borderRadius: "8px",
  border: "1px solid var(--color-border)",
  background: "transparent",
  color: "var(--color-text-primary)",
  cursor: "pointer",
};
