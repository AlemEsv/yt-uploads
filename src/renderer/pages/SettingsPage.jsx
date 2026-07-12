import React, { useEffect, useState } from "react";
import { DatabaseBackup, FileText, Folder, RefreshCw, Volume2 } from "lucide-react";
import { useApi } from "../hooks/useApi.js";
import { useToast } from "../context/ToastContext.jsx";
import { useLibrary } from "../context/LibraryContext.jsx";
import OnboardingLegalPage from "./OnboardingLegalPage.jsx";

const QUALITY_OPTIONS = [128, 192, 256, 320];

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

      <div className="flex flex-col gap-4 max-w-[640px]">
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
                    : "bg-white/5 text-[var(--color-muted-text)] hover:text-white hover:bg-white/10"
                }`}
              >
                {kbps} kbps
              </button>
            ))}
          </div>
        </SettingsCard>

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

        <SettingsCard
          icon={FileText}
          title="About"
          description="Usage terms and responsibility notice."
        >
          <button type="button" onClick={() => setShowLegal(true)} className={secondaryButton}>
            View legal notice
          </button>
        </SettingsCard>
      </div>

      {showLegal && <OnboardingLegalPage mode="about" onClose={() => setShowLegal(false)} />}
    </div>
  );
}

const secondaryButton =
  "px-4 py-2 rounded-[8px] border border-white/10 bg-transparent text-white text-[13px] cursor-pointer hover:bg-white/5 transition-colors";
