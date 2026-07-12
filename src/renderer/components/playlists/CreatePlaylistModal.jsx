import React, { useState } from "react";

export default function CreatePlaylistModal({ onClose, onCreate }) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleCreate(event) {
    event.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onCreate(name.trim());
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[2000]">
      <form
        onSubmit={handleCreate}
        className="popover-in glass border border-[var(--color-overlay-border)] rounded-[12px] p-6 w-[320px] flex flex-col gap-3"
      >
        <h2 className="m-0 text-[16px] font-bold">New playlist</h2>
        <input
          autoFocus
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Playlist name"
          className="w-full px-3 py-2 rounded-[6px] border border-[var(--color-overlay-border)] bg-[var(--color-overlay-subtle)] text-[var(--color-text-primary)] text-[13px] outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
        />
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-[8px] border border-[var(--color-overlay-border)] bg-transparent text-[var(--color-text-primary)] text-[13px] cursor-pointer hover:bg-[var(--color-overlay-subtle)] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!name.trim() || saving}
            className={`px-4 py-1.5 rounded-[8px] border-none bg-[var(--color-accent)] text-white text-[13px] font-semibold transition-opacity ${
              name.trim() && !saving
                ? "cursor-pointer hover:opacity-90"
                : "opacity-50 cursor-not-allowed"
            }`}
          >
            Create
          </button>
        </div>
      </form>
    </div>
  );
}
