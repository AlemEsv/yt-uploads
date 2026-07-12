import React from "react";
import EmptyState from "../components/common/EmptyState.jsx";

export default function EventsPage() {
  return (
    <div>
      <div style={{ padding: "1rem 1.5rem 0" }}>
        <h2 style={{ margin: 0 }}>Eventos</h2>
      </div>
      <EmptyState title="Próximamente" description="Todavía no hay nada por aquí." />
    </div>
  );
}
