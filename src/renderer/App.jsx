import React from "react";
import { BackendProvider, useBackend } from "./context/BackendContext.jsx";

const STATUS_LABEL = {
  starting: "Iniciando el motor local...",
  ready: "Backend: ready",
  crashed: "Se perdió la conexión con el motor local. Reintentando...",
  restarting: "Reiniciando el motor local...",
};

function BackendStatusScreen() {
  const { status, config } = useBackend();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        gap: "0.5rem",
      }}
    >
      <h1 style={{ fontSize: "1.25rem", fontWeight: 600 }}>SoundDock</h1>
      <p style={{ color: "var(--color-text-secondary)" }}>
        {STATUS_LABEL[status] ?? status}
      </p>
      {status === "ready" && config ? (
        <p style={{ color: "var(--color-text-secondary)", fontSize: "0.8rem" }}>
          {config.httpBaseUrl}
        </p>
      ) : null}
    </div>
  );
}

export default function App() {
  return (
    <BackendProvider>
      <BackendStatusScreen />
    </BackendProvider>
  );
}
