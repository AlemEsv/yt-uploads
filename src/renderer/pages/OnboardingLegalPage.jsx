import React, { useState } from "react";

const LEGAL_TEXT = [
  "SoundDock está concebido como una herramienta de uso personal para gestionar una biblioteca musical propia en el equipo del usuario. La aplicación no aloja, redistribuye ni comparte contenido entre usuarios: toda la música descargada permanece almacenada localmente en el dispositivo de quien la utiliza.",
  "El uso de la función de captura desde YouTube y SoundCloud está sujeto a los Términos de Servicio de dichas plataformas y a la legislación de derechos de autor vigente en la jurisdicción del usuario. La responsabilidad sobre el contenido descargado y el uso que se le dé recae exclusivamente en la persona que opera la aplicación.",
];

export default function OnboardingLegalPage({ mode = "onboarding", onAccept, onClose }) {
  const [checked, setChecked] = useState(false);

  return (
    <div style={overlayStyle}>
      <div style={boxStyle}>
        <h2 style={{ margin: 0 }}>Acerca de SoundDock</h2>
        {LEGAL_TEXT.map((paragraph) => (
          <p key={paragraph.slice(0, 20)} style={{ color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
            {paragraph}
          </p>
        ))}

        {mode === "onboarding" ? (
          <>
            <label style={{ display: "flex", gap: "0.5rem", alignItems: "center", fontSize: "0.85rem" }}>
              <input type="checkbox" checked={checked} onChange={(event) => setChecked(event.target.checked)} />
              Entiendo y acepto lo anterior
            </label>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button type="button" disabled={!checked} onClick={onAccept} style={primaryButton}>
                Continuar
              </button>
            </div>
          </>
        ) : (
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose} style={primaryButton}>
              Cerrar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0, 0, 0, 0.75)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 3000,
};

const boxStyle = {
  background: "#131212",
  border: "1px solid var(--color-border)",
  borderRadius: "12px",
  padding: "2rem",
  width: "480px",
  maxHeight: "80vh",
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
};

const primaryButton = {
  padding: "0.5rem 1.25rem",
  borderRadius: "8px",
  border: "none",
  background: "var(--color-accent)",
  color: "white",
  cursor: "pointer",
};
