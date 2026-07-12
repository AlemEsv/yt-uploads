import React from "react";
import { Disc3, Search } from "lucide-react";
import { useLibrary } from "../../context/LibraryContext.jsx";
import DownloadTrigger from "./DownloadTrigger.jsx";
import UserMenu from "./UserMenu.jsx";

export default function TopBar({ activeView, onSelectView }) {
  const { searchQuery, setSearchQuery } = useLibrary();

  function handleSearchChange(value) {
    setSearchQuery(value);
    if (value && activeView !== "library" && activeView !== "favorites") {
      onSelectView("library");
    }
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        padding: "0.75rem 1.25rem",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
        <Disc3 size={22} strokeWidth={2.25} />
        <strong style={{ fontSize: "1.05rem" }}>SoundDock</strong>
      </div>

      <div
        style={{
          flex: 1,
          maxWidth: "605px",
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
          background: "var(--color-search-bg)",
          borderRadius: "6px",
          height: "34px",
          padding: "0 0.9rem",
        }}
      >
        <Search size={16} color="var(--color-search-placeholder)" />
        <input
          type="text"
          className="sounddock-search-input"
          value={searchQuery}
          onChange={(event) => handleSearchChange(event.target.value)}
          placeholder="Buscar canciones o artistas"
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            background: "transparent",
            color: "var(--color-search-text)",
            fontSize: "0.85rem",
          }}
        />
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexShrink: 0 }}>
        <DownloadTrigger />
        <UserMenu activeView={activeView} onSelectView={onSelectView} />
      </div>
    </div>
  );
}
