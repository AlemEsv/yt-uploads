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
    <div ref={panelRef} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title="Descargar desde un enlace"
        style={{
          width: "38px",
          height: "38px",
          borderRadius: "50%",
          border: "1px solid var(--color-border)",
          background: open ? "var(--color-accent)" : "var(--color-sidebar-bg)",
          color: "var(--color-text-primary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        <Download size={18} strokeWidth={2.25} />
      </button>

      {open && (
        <form
          onSubmit={handleSubmit}
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: "0.5rem",
            width: "340px",
            padding: "0.75rem",
            borderRadius: "12px",
            border: "1px solid var(--color-border)",
            background: "var(--color-sidebar-bg)",
            boxShadow: "0 12px 32px rgba(0,0,0,0.5)",
            display: "flex",
            gap: "0.5rem",
            zIndex: 2000,
          }}
        >
          <input
            type="text"
            autoFocus
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="Pega un enlace de YouTube o SoundCloud"
            style={{
              flex: 1,
              padding: "0.5rem 0.75rem",
              borderRadius: "8px",
              border: "1px solid var(--color-border)",
              background: "#0c0c0c",
              color: "var(--color-text-primary)",
            }}
          />
          <button
            type="submit"
            disabled={!url.trim() || !api}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              border: "none",
              background: "var(--color-cta)",
              color: "white",
              cursor: url.trim() && api ? "pointer" : "not-allowed",
              opacity: url.trim() && api ? 1 : 0.5,
            }}
          >
            Descargar
          </button>
        </form>
      )}
    </div>
  );
}
