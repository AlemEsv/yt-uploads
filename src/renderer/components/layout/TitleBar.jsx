import React, { useEffect, useRef, useState } from "react";
import { Minus, MoreHorizontal, Square, X } from "lucide-react";

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

export default function TitleBar() {
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
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              marginTop: "0.25rem",
              background: "var(--color-sidebar-bg)",
              border: "1px solid var(--color-border)",
              borderRadius: "8px",
              minWidth: "160px",
              zIndex: 3000,
              WebkitAppRegion: "no-drag",
            }}
          >
            <button
              type="button"
              onClick={() => window.sounddock.closeWindow()}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "0.5rem 0.75rem",
                border: "none",
                background: "transparent",
                color: "var(--color-text-primary)",
                cursor: "pointer",
                font: "inherit",
              }}
            >
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
