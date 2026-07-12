import React from "react";
import EmptyState from "../components/common/EmptyState.jsx";

export default function GenresPage() {
  return (
    <div>
      <div style={{ padding: "1rem 1.5rem 0" }}>
        <h2 style={{ margin: 0 }}>Géneros</h2>
      </div>
      <EmptyState
        title="Próximamente"
        description="El género no se detecta automáticamente al descargar; podrás explorar por género una vez que lo edites manualmente en tus canciones."
      />
    </div>
  );
}
