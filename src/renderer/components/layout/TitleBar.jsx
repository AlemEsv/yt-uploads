import React, { useEffect, useRef, useState } from "react";
import { ListMusic, Minus, MoreHorizontal, Plus, Settings, Square, X } from "lucide-react";

const buttonStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "36px",
  height: "28px",
  border: "none",
  background: "transparent",
  color: "var(--color-text-secondary)",
  cursor: "pointer",
  WebkitAppRegion: "no-drag",
};

const menuItemStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  width: "100%",
  textAlign: "left",
  padding: "0.5rem 0.75rem",
  border: "none",
  background: "transparent",
  color: "var(--color-text-primary)",
  cursor: "pointer",
  font: "inherit",
};

export default function TitleBar({
  onSelectView,
  onNewPlaylist,
  onToggleQueue,
  onShowAbout,
  showQueue,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    window.sounddock.isWindowMaximized().then(setIsMaximized);
    return window.sounddock.onWindowMaximizedChange(setIsMaximized);
  }, []);

  useEffect(() => {
    if (!menuOpen) return undefined;
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  function runAndClose(action) {
    return () => {
      action?.();
      setMenuOpen(false);
    };
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        height: "32px",
        flexShrink: 0,
        background: "var(--color-bg-base)",
        WebkitAppRegion: "drag",
      }}
    >
      <div ref={menuRef} style={{ position: "relative" }}>
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          style={{ ...buttonStyle, marginLeft: "0.5rem" }}
          title="Más opciones"
        >
          <MoreHorizontal size={16} />
        </button>
        {menuOpen && (
          <div
            className="popover-in glass"
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              marginTop: "0.25rem",
              borderRadius: "8px",
              minWidth: "200px",
              zIndex: 3000,
              WebkitAppRegion: "no-drag",
              overflow: "hidden",
            }}
          >
            <button
              type="button"
              onClick={runAndClose(onNewPlaylist)}
              disabled={!onNewPlaylist}
              style={{ ...menuItemStyle, opacity: onNewPlaylist ? 1 : 0.4 }}
            >
              <Plus size={14} /> Nueva playlist
            </button>
            <button
              type="button"
              onClick={runAndClose(() => onSelectView?.("settings"))}
              disabled={!onSelectView}
              style={{ ...menuItemStyle, opacity: onSelectView ? 1 : 0.4 }}
            >
              <Settings size={14} /> Configuración
            </button>
            <button
              type="button"
              onClick={runAndClose(onToggleQueue)}
              disabled={!onToggleQueue}
              style={{ ...menuItemStyle, opacity: onToggleQueue ? 1 : 0.4 }}
            >
              <ListMusic size={14} /> {showQueue ? "Ocultar" : "Mostrar"} cola de reproducción
            </button>
            <button type="button" onClick={runAndClose(onShowAbout)} style={menuItemStyle}>
              Acerca de SoundDock
            </button>
            <div style={{ borderTop: "1px solid var(--color-border)" }} />
            <button type="button" onClick={() => window.sounddock.quitApp()} style={menuItemStyle}>
              Salir de SoundDock
            </button>
          </div>
        )}
      </div>

      <div style={{ flex: 1, height: "100%" }} />

      <button
        type="button"
        onClick={() => window.sounddock.minimizeWindow()}
        style={buttonStyle}
        title="Minimizar"
      >
        <Minus size={16} />
      </button>
      <button
        type="button"
        onClick={() => window.sounddock.toggleMaximizeWindow()}
        style={buttonStyle}
        title={isMaximized ? "Restaurar" : "Maximizar"}
      >
        <Square size={14} />
      </button>
      <button
        type="button"
        onClick={() => window.sounddock.closeWindow()}
        style={{ ...buttonStyle, marginRight: "0.25rem" }}
        title="Cerrar"
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "var(--color-cta)";
          e.currentTarget.style.color = "white";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "var(--color-text-secondary)";
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
}
