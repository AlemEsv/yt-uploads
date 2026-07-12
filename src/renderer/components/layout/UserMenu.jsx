import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, User } from "lucide-react";
import { useTheme } from "../../context/ThemeContext.jsx";

const MENU_ITEMS = [
  { id: "profiles", label: "Perfiles Temáticos" },
  { id: "stats", label: "Estadísticas" },
  { id: "settings", label: "Configuración" },
];

export default function UserMenu({ activeView, onSelectView }) {
  const { profiles, activeProfileId } = useTheme();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const activeProfile = profiles.find((p) => p.id === activeProfileId);

  return (
    <div ref={menuRef} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          minWidth: "180px",
          padding: "0.3rem 0.75rem 0.3rem 0.3rem",
          borderRadius: "6px",
          border: "1px solid var(--color-border)",
          background: "var(--color-sidebar-bg)",
          color: "var(--color-text-primary)",
          cursor: "pointer",
        }}
      >
        <span
          style={{
            width: "26px",
            height: "26px",
            borderRadius: "50%",
            background: activeProfile?.paleta_colores?.accent ?? "var(--color-accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <User size={14} strokeWidth={2.25} />
        </span>
        <span
          style={{
            fontSize: "0.85rem",
            fontWeight: 600,
            flex: 1,
            textAlign: "left",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {activeProfile?.nombre ?? "Sin perfil"}
        </span>
        <ChevronDown size={16} strokeWidth={2.25} color="var(--color-text-secondary)" />
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: "0.4rem",
            background: "var(--color-sidebar-bg)",
            border: "1px solid var(--color-border)",
            borderRadius: "8px",
            minWidth: "200px",
            overflow: "hidden",
            zIndex: 2000,
          }}
        >
          {MENU_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onSelectView(item.id);
                setOpen(false);
              }}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "0.6rem 0.9rem",
                border: "none",
                background: activeView === item.id ? "var(--color-accent)" : "transparent",
                color: "var(--color-text-primary)",
                cursor: "pointer",
                font: "inherit",
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
