import React from "react";
import EmptyState from "../components/common/EmptyState.jsx";

export default function AlbumsPage() {
  return (
    <div>
      <div style={{ padding: "1rem 1.5rem 0" }}>
        <h2 style={{ margin: 0 }}>Álbumes</h2>
      </div>
      <EmptyState
        title="Próximamente"
        description="Vas a poder navegar tu biblioteca agrupada por álbum."
      />
    </div>
  );
}
