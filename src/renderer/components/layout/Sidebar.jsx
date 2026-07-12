import React from "react";
import {
  CalendarDays,
  Disc3,
  HardDrive,
  Heart,
  History,
  Home,
  ListMusic,
  Tags,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext.jsx";

const NAV_SECTIONS = [
  {
    label: "Descubrir",
    items: [
      { id: "home", label: "Home", icon: Home },
      { id: "genres", label: "Géneros", icon: Tags },
      { id: "albums", label: "Álbumes", icon: Disc3 },
      { id: "events", label: "Eventos", icon: CalendarDays },
    ],
  },
  {
    label: "Biblioteca",
    items: [
      { id: "recent", label: "Reciente", icon: History },
      { id: "favorites", label: "Favoritos", icon: Heart },
      { id: "library", label: "Local", icon: HardDrive },
    ],
  },
];

function sectionLabelStyle() {
  return {
    fontSize: "0.7rem",
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "var(--color-text-secondary)",
    padding: "1.1rem 0.75rem 0.4rem",
  };
}

function navRowStyle(active) {
  return {
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
    width: "100%",
    padding: "0.55rem 0.75rem",
    borderRadius: "10px",
    border: "none",
    background: active ? "var(--color-accent)" : "transparent",
    color: "var(--color-text-primary)",
    cursor: "pointer",
    font: "inherit",
    fontSize: "0.85rem",
    fontWeight: 600,
    textAlign: "left",
  };
}

export default function Sidebar({ activeView, onSelectView }) {
  const { profiles, activeProfileId, activateProfile } = useTheme();

  return (
    <nav
      style={{
        background: "var(--color-sidebar-bg)",
        borderRadius: "15px",
        margin: "0.75rem",
        padding: "0.5rem 0.5rem 1rem",
        display: "flex",
        flexDirection: "column",
        width: "254px",
        flexShrink: 0,
        border: "1px solid var(--color-border)",
        overflowY: "auto",
      }}
    >
      {NAV_SECTIONS.map((section) => (
        <div key={section.label}>
          <div style={sectionLabelStyle()}>{section.label}</div>
          {section.items.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectView(item.id)}
                style={navRowStyle(activeView === item.id)}
              >
                <Icon size={18} strokeWidth={2.25} />
                {item.label}
              </button>
            );
          })}
        </div>
      ))}

      <div>
        <div style={sectionLabelStyle()}>Tu playlist</div>
        <button
          type="button"
          onClick={() => onSelectView("playlists")}
          style={navRowStyle(activeView === "playlists")}
        >
          <ListMusic size={18} strokeWidth={2.25} />
          Crear playlist
        </button>
        {profiles.map((profile) => (
          <button
            key={profile.id}
            type="button"
            onClick={() => activateProfile(profile.id)}
            style={navRowStyle(profile.id === activeProfileId)}
            title={`Activar perfil ${profile.nombre}`}
          >
            <span
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: profile.paleta_colores?.accent ?? "var(--color-accent)",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {profile.nombre}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
}
