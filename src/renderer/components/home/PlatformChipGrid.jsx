import React, { useMemo } from "react";
import { FolderOpen, Video, Waves } from "lucide-react";
import { useLibrary } from "../../context/LibraryContext.jsx";

const PLATFORMS = [
  { id: "youtube", label: "YouTube", icon: Video, color: "var(--color-platform-youtube)" },
  { id: "soundcloud", label: "SoundCloud", icon: Waves, color: "var(--color-platform-soundcloud)" },
  {
    id: "importado",
    label: "Importado",
    icon: FolderOpen,
    color: "var(--color-platform-importado)",
  },
];

export default function PlatformChipGrid({ onSelectView }) {
  const { songs, setPlatformFilter } = useLibrary();

  const counts = useMemo(() => {
    const map = {};
    for (const song of songs) {
      map[song.plataforma_origen] = (map[song.plataforma_origen] ?? 0) + 1;
    }
    return map;
  }, [songs]);

  function handleClick(platformId) {
    setPlatformFilter(platformId);
    onSelectView("library");
  }

  return (
    <div
      style={{
        background: "var(--color-sidebar-bg)",
        borderRadius: "15px",
        padding: "1.25rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.6rem",
      }}
    >
      <h3 style={{ margin: "0 0 0.25rem", fontWeight: 700, fontSize: "1.15rem" }}>Tu origen</h3>
      {PLATFORMS.map((platform) => {
        const Icon = platform.icon;
        return (
          <button
            key={platform.id}
            type="button"
            onClick={() => handleClick(platform.id)}
            style={{
              height: "60px",
              borderRadius: "10px",
              border: "none",
              background: platform.color,
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              padding: "0 1rem",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: "0.85rem",
            }}
          >
            <Icon size={20} strokeWidth={2.25} />
            {platform.label} · {counts[platform.id] ?? 0}
          </button>
        );
      })}
    </div>
  );
}
