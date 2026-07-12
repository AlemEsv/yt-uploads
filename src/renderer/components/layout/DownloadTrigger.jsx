import React, { useEffect, useRef, useState } from "react";
import { Download } from "lucide-react";
import { useApi } from "../../hooks/useApi.js";

export default function DownloadTrigger() {
  const api = useApi();
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    function handleClickOutside(event) {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!url.trim() || !api) return;
    try {
      await api.startDownload(url.trim());
      setUrl("");
      setOpen(false);
    } catch {
      // El error real llega por WebSocket (download_error) y se muestra como toast.
    }
  }

  return (
    <div ref={panelRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title="Download from a link"
        className={`w-[34px] h-[34px] rounded-[6px] flex items-center justify-center border-none cursor-pointer transition-colors ${
          open ? "bg-[var(--color-accent)]" : "bg-[#080808] hover:bg-white/10"
        }`}
      >
        <Download size={15} className="text-white" />
      </button>

      {open && (
        <form
          onSubmit={handleSubmit}
          className="absolute top-full right-0 mt-2 w-[340px] p-3 rounded-[12px] border border-white/10 bg-[#080808] shadow-2xl flex gap-2 z-[2000]"
        >
          <input
            type="text"
            autoFocus
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="Paste a YouTube or SoundCloud link"
            className="flex-1 px-3 py-2 rounded-[8px] border border-white/10 bg-[#0c0c0c] text-white text-[13px] outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
          />
          <button
            type="submit"
            disabled={!url.trim() || !api}
            className={`px-4 py-2 rounded-[8px] border-none text-white text-[13px] font-semibold transition-colors ${
              url.trim() && api
                ? "bg-[var(--color-accent)] cursor-pointer hover:opacity-90"
                : "bg-[var(--color-accent)] opacity-50 cursor-not-allowed"
            }`}
          >
            Download
          </button>
        </form>
      )}
    </div>
  );
}
