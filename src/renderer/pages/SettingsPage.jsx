import React, { useEffect, useState } from "react";
import {
  DatabaseBackup,
  FileText,
  Folder,
  Moon,
  RefreshCw,
  Sun,
  User,
  Volume2,
} from "lucide-react";
import { useApi } from "../hooks/useApi.js";
import { useToast } from "../context/ToastContext.jsx";
import { useLibrary } from "../context/LibraryContext.jsx";
import { useAppearance } from "../context/AppearanceContext.jsx";
import OnboardingLegalPage from "./OnboardingLegalPage.jsx";

const QUALITY_OPTIONS = [128, 192, 256, 320];

const ACCENT_PRESETS = [
  { label: "Sky", value: "#0ea5e9" },
  { label: "Violet", value: "#8b5cf6" },
  { label: "Pink", value: "#ec4899" },
  { label: "Green", value: "#22c55e" },
  { label: "Orange", value: "#f97316" },
  { label: "Rose", value: "#ef4444" },
];

const CATEGORIES = [
  { id: "general", label: "General", icon: User },
  { id: "appearance", label: "Appearance", icon: Sun },
  { id: "storage", label: "Storage", icon: Folder },
  { id: "backup", label: "Backup", icon: DatabaseBackup },
  { id: "about", label: "About", icon: FileText },
];

function SettingsCard({ icon: Icon, title, description, children }) {
  return (
    <div className="glass rounded-[15px] p-5">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-9 h-9 rounded-[8px] flex items-center justify-center bg-[var(--color-accent-soft)] shrink-0">
          <Icon size={16} className="text-[var(--color-accent)]" />
        </div>
        <div>
          <h3 className="text-[15px] font-bold m-0">{title}</h3>
          <p className="text-[12px] text-[var(--color-muted-text)] m-0">{description}</p>
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function ThemeCard({ label, Icon, active, onClick, previewBg, previewSurface, previewAccent }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex-1 rounded-[12px] border p-3 flex flex-col items-center gap-3 cursor-pointer transition-colors ${
        active
          ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)]"
          : "border-[var(--color-overlay-border)] bg-[var(--color-overlay-subtle)] hover:bg-[var(--color-overlay-hover)]"
      }`}
    >
      {active && (
        <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-white text-[11px] font-bold z-10">
          ✓
        </span>
      )}
      <div
        className="w-full h-[72px] rounded-[8px] overflow-hidden border border-[var(--color-overlay-border)] flex"
        style={{ background: previewBg }}
      >
        <div className="w-[26%] h-full" style={{ background: previewSurface }} />
        <div className="flex-1 flex items-center justify-center">
          <Icon size={20} style={{ color: previewAccent }} />
        </div>
      </div>
      <span className="text-[13px] font-medium">{label}</span>
    </button>
  );
}

export default function SettingsPage() {
  const api = useApi();
  const { showSuccess, showError } = useToast();
  const { scanLibrary, refetch } = useLibrary();
  const { tema, setTema, nombreUsuario, setNombreUsuario, colorAcento, setColorAcento } =
    useAppearance();
  const [settings, setSettings] = useState(null);
  const [showLegal, setShowLegal] = useState(false);
  const [activeCategory, setActiveCategory] = useState("general");
  const [nameInput, setNameInput] = useState(nombreUsuario);

  useEffect(() => {
    if (!api) return;
    api.getSettings().then(setSettings);
  }, [api]);

  useEffect(() => {
    setNameInput(nombreUsuario);
  }, [nombreUsuario]);

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

  async function handleScan() {
    try {
      await scanLibrary();
      showSuccess({
        title: "Scan complete",
        message: "Your library is in sync with the configured folder.",
      });
    } catch {
      showError({ title: "Scan failed", message: "The library scan could not be completed." });
    }
  }

  async function handleExport() {
    const destino = await window.sounddock.chooseBackupExportPath();
    if (!destino) return;
    try {
      const result = await api.exportBackup(destino);
      showSuccess({ title: "Backup exported", message: `Saved to ${result.exportado_a}` });
    } catch {
      showError({ title: "Export failed", message: "The backup file could not be created." });
    }
  }

  async function handleImport() {
    const origen = await window.sounddock.chooseBackupImportPath();
    if (!origen) return;
    if (!confirm("This will replace your current library with the backup contents. Continue?"))
      return;
    try {
      const result = await api.importBackup(origen);
      showSuccess({
        title: "Backup restored",
        message: `${result.canciones_totales} songs in the restored catalog.`,
      });
      await refetch();
    } catch {
      showError({ title: "Restore failed", message: "The selected backup could not be restored." });
    }
  }

  function handleNameBlur() {
    const trimmed = nameInput.trim();
    if (trimmed && trimmed !== nombreUsuario) {
      setNombreUsuario(trimmed);
    } else {
      setNameInput(nombreUsuario);
    }
  }

  if (!settings) {
    return (
      <div className="page-surface min-h-full p-6">
        <p className="text-[13px] text-[var(--color-muted-text)]">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="page-surface min-h-full p-6">
      <h1 className="text-[28px] font-bold m-0 mb-6">Settings</h1>

      <div className="flex gap-6 max-w-[900px]">
        <nav className="w-[180px] shrink-0 flex flex-col gap-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-[13px] font-medium text-left border-none cursor-pointer transition-colors ${
                activeCategory === cat.id
                  ? "bg-[var(--color-accent)] text-white"
                  : "bg-transparent text-[var(--color-muted-text)] hover:bg-[var(--color-overlay-subtle)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              <cat.icon size={15} />
              {cat.label}
            </button>
          ))}
        </nav>

        <div className="flex-1 flex flex-col gap-4 min-w-0">
          {activeCategory === "general" && (
            <>
              <SettingsCard
                icon={User}
                title="Display name"
                description="Shown in the profile pill at the top right."
              >
                <input
                  type="text"
                  value={nameInput}
                  onChange={(event) => setNameInput(event.target.value)}
                  onBlur={handleNameBlur}
                  maxLength={40}
                  className="w-full max-w-[280px] px-3 py-2 rounded-[8px] border border-[var(--color-overlay-border)] bg-[var(--color-input-bg)] text-[13px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
                />
              </SettingsCard>

              <SettingsCard
                icon={Volume2}
                title="Audio quality"
                description="Bitrate used when converting downloads to MP3."
              >
                <div className="flex gap-2">
                  {QUALITY_OPTIONS.map((kbps) => (
                    <button
                      key={kbps}
                      type="button"
                      onClick={() => updateSetting({ calidad_audio_kbps: kbps })}
                      className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors border-none cursor-pointer ${
                        settings.calidad_audio_kbps === kbps
                          ? "bg-[var(--color-accent)] text-white"
                          : "bg-[var(--color-overlay-subtle)] text-[var(--color-muted-text)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-overlay-hover)]"
                      }`}
                    >
                      {kbps} kbps
                    </button>
                  ))}
                </div>
              </SettingsCard>
            </>
          )}

          {activeCategory === "appearance" && (
            <>
              <SettingsCard
                icon={Sun}
                title="Theme"
                description="Choose how SoundDock looks on your device."
              >
                <div className="flex gap-4">
                  <ThemeCard
                    label="Dark"
                    Icon={Moon}
                    active={tema === "oscuro"}
                    onClick={() => setTema("oscuro")}
                    previewBg="#0a0a0a"
                    previewSurface="#1c1c1c"
                    previewAccent="#ffffff"
                  />
                  <ThemeCard
                    label="Light"
                    Icon={Sun}
                    active={tema === "claro"}
                    onClick={() => setTema("claro")}
                    previewBg="#f0f0f0"
                    previewSurface="#ffffff"
                    previewAccent="#14141a"
                  />
                </div>
              </SettingsCard>

              <SettingsCard
                icon={Sun}
                title="Accent color"
                description="Used for buttons, active states, and highlights across the app."
              >
                <div className="flex gap-3">
                  {ACCENT_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setColorAcento(preset.value)}
                      title={preset.label}
                      className={`relative w-9 h-9 rounded-full border-none cursor-pointer transition-transform hover:scale-110 ${
                        colorAcento.toLowerCase() === preset.value
                          ? "ring-2 ring-offset-2 ring-[var(--color-text-primary)] ring-offset-[var(--color-surface-raised)]"
                          : ""
                      }`}
                      style={{ backgroundColor: preset.value }}
                    />
                  ))}
                </div>
              </SettingsCard>
            </>
          )}

          {activeCategory === "storage" && (
            <SettingsCard
              icon={Folder}
              title="Download folder"
              description="Where new downloads and your library live."
            >
              <div className="flex items-center gap-3">
                <p className="flex-1 text-[13px] text-[var(--color-text-secondary)] truncate m-0">
                  {settings.directorio_descarga}
                </p>
                <button type="button" onClick={handleChooseFolder} className={secondaryButton}>
                  Change
                </button>
                <button
                  type="button"
                  onClick={handleScan}
                  className={`${secondaryButton} flex items-center gap-2`}
                >
                  <RefreshCw size={13} /> Scan
                </button>
              </div>
            </SettingsCard>
          )}

          {activeCategory === "backup" && (
            <SettingsCard
              icon={DatabaseBackup}
              title="Backup"
              description="Export or restore your whole catalog (songs, history, likes) as a single file."
            >
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleExport}
                  className="px-4 py-2 rounded-[8px] border-none bg-[var(--color-accent)] text-white text-[13px] font-semibold cursor-pointer hover:opacity-90 transition-opacity"
                >
                  Export backup
                </button>
                <button type="button" onClick={handleImport} className={secondaryButton}>
                  Restore from file
                </button>
              </div>
            </SettingsCard>
          )}

          {activeCategory === "about" && (
            <SettingsCard
              icon={FileText}
              title="About"
              description="Usage terms and responsibility notice."
            >
              <button type="button" onClick={() => setShowLegal(true)} className={secondaryButton}>
                View legal notice
              </button>
            </SettingsCard>
          )}
        </div>
      </div>

      {showLegal && <OnboardingLegalPage mode="about" onClose={() => setShowLegal(false)} />}
    </div>
  );
}

const secondaryButton =
  "px-4 py-2 rounded-[8px] border border-[var(--color-overlay-border)] bg-transparent text-[var(--color-text-primary)] text-[13px] cursor-pointer hover:bg-[var(--color-overlay-subtle)] transition-colors";
