import React, { useState } from "react";
import { useApi } from "../../hooks/useApi.js";
import { useToast } from "../../context/ToastContext.jsx";

const PRESET_GENRES = [
  "Pop",
  "Rock",
  "Hip-Hop",
  "Dance/Electronic",
  "K-Pop",
  "R&B/Soul",
  "Jazz",
  "Classical",
  "Indie",
  "Metal",
  "Reggae",
  "Latin",
];

const CUSTOM = "__custom__";

export default function MetadataEditModal({ cancion, onClose, onSaved }) {
  const api = useApi();
  const { showError } = useToast();
  const initialGenre = cancion.genero ?? "";
  const initialIsPreset = initialGenre === "" || PRESET_GENRES.includes(initialGenre);
  const [titulo, setTitulo] = useState(cancion.titulo ?? "");
  const [artista, setArtista] = useState(cancion.artista ?? "");
  const [genreChoice, setGenreChoice] = useState(initialIsPreset ? initialGenre : CUSTOM);
  const [customGenre, setCustomGenre] = useState(initialIsPreset ? "" : initialGenre);
  const [saving, setSaving] = useState(false);
  const [changingCover, setChangingCover] = useState(false);
  const [coverError, setCoverError] = useState(false);

  async function handleSave() {
    if (!api) return;
    setSaving(true);
    try {
      const genero = genreChoice === CUSTOM ? customGenre.trim() : genreChoice;
      const updated = await api.patchLibrarySong(cancion.id, {
        titulo,
        artista,
        genero: genero || null,
      });
      onSaved?.(updated);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  async function handleChangeCover() {
    if (!api) return;
    const path = await window.sounddock.chooseImageFile();
    if (!path) return;
    setChangingCover(true);
    try {
      const updated = await api.updateCover(cancion.id, path);
      setCoverError(false);
      onSaved?.(updated);
    } catch {
      showError({
        title: "Cover update failed",
        message: "The cover for this song could not be updated.",
      });
    } finally {
      setChangingCover(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[2000]">
      <div className="glass border border-[var(--color-overlay-border)] rounded-[12px] p-6 w-[360px] flex flex-col gap-3">
        <h2 className="m-0 text-[17px] font-bold">Edit metadata</h2>
        <p className="m-0 text-[13px] text-[var(--color-muted-text)]">
          Review this song's details before saving it to your library.
        </p>

        <div className="flex items-center gap-3">
          <div className="w-[64px] h-[64px] rounded-[8px] bg-[var(--color-cover-placeholder-bg)] overflow-hidden shrink-0">
            {!coverError && api && (
              <img
                src={api.coverUrl(cancion.id, cancion.fecha_modificacion)}
                alt=""
                onError={() => setCoverError(true)}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <button
            type="button"
            onClick={handleChangeCover}
            disabled={changingCover}
            className={secondaryButton}
          >
            {changingCover ? "Updating..." : "Change cover"}
          </button>
        </div>

        <label className={labelClass}>
          Title
          <input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className={inputClass}
          />
        </label>

        <label className={labelClass}>
          Artist
          <input
            value={artista}
            onChange={(e) => setArtista(e.target.value)}
            className={inputClass}
          />
        </label>

        <label className={labelClass}>
          Genre
          <select
            value={genreChoice}
            onChange={(e) => setGenreChoice(e.target.value)}
            className={inputClass}
            style={{ colorScheme: "dark" }}
          >
            <option
              value=""
              style={{ background: "var(--color-input-bg)", color: "var(--color-text-primary)" }}
            >
              None
            </option>
            {PRESET_GENRES.map((genre) => (
              <option
                key={genre}
                value={genre}
                style={{ background: "var(--color-input-bg)", color: "var(--color-text-primary)" }}
              >
                {genre}
              </option>
            ))}
            <option
              value={CUSTOM}
              style={{ background: "var(--color-input-bg)", color: "var(--color-text-primary)" }}
            >
              Custom…
            </option>
          </select>
        </label>

        {genreChoice === CUSTOM && (
          <input
            value={customGenre}
            onChange={(e) => setCustomGenre(e.target.value)}
            placeholder="Type a custom genre"
            autoFocus
            className={inputClass}
          />
        )}

        <div className="flex justify-end gap-2 mt-2">
          <button type="button" onClick={onClose} className={secondaryButton}>
            Close
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-1.5 rounded-[8px] border-none bg-[var(--color-accent)] text-white text-[13px] font-semibold cursor-pointer hover:opacity-90 transition-opacity"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

const labelClass = "text-[12px] text-[var(--color-muted-text)] flex flex-col gap-1";
const inputClass =
  "w-full px-3 py-2 rounded-[6px] border border-[var(--color-overlay-border)] bg-[var(--color-input-bg)] text-[var(--color-text-primary)] text-[13px] outline-none focus:ring-1 focus:ring-[var(--color-overlay-border-strong)]";
const secondaryButton =
  "px-4 py-1.5 rounded-[8px] border border-[var(--color-overlay-border)] bg-transparent text-[var(--color-text-primary)] text-[13px] cursor-pointer hover:bg-[var(--color-overlay-subtle)] transition-colors";
