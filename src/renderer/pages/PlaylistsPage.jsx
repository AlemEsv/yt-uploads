import React from "react";
import EmptyState from "../components/common/EmptyState.jsx";

export default function PlaylistsPage() {
  return (
    <div>
      <div style={{ padding: "1rem 1.5rem 0" }}>
        <h2 style={{ margin: 0 }}>Playlists</h2>
      </div>
      <EmptyState
        title="Próximamente"
        description="Vas a poder crear tus propias playlists agrupando canciones de tu biblioteca."
      />
    </div>
  );
}
