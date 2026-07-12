import React, { useState } from "react";

const LEGAL_TEXT = [
  "SoundDock está concebido como una herramienta de uso personal para gestionar una biblioteca musical propia en el equipo del usuario. La aplicación no aloja, redistribuye ni comparte contenido entre usuarios: toda la música descargada permanece almacenada localmente en el dispositivo de quien la utiliza.",
  "El uso de la función de captura desde YouTube y SoundCloud está sujeto a los Términos de Servicio de dichas plataformas y a la legislación de derechos de autor vigente en la jurisdicción del usuario. La responsabilidad sobre el contenido descargado y el uso que se le dé recae exclusivamente en la persona que opera la aplicación.",
];

export default function OnboardingLegalPage({ mode = "onboarding", onAccept, onClose }) {
  const [checked, setChecked] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-[3000]">
      <div className="popover-in glass border border-[var(--color-overlay-border)] rounded-[15px] p-8 w-[480px] max-h-[80vh] overflow-y-auto flex flex-col gap-3">
        <h2 className="m-0 text-[18px] font-bold">About SoundDock</h2>
        {LEGAL_TEXT.map((paragraph) => (
          <p
            key={paragraph.slice(0, 20)}
            className="m-0 text-[13px] text-[var(--color-muted-text)] leading-relaxed"
          >
            {paragraph}
          </p>
        ))}

        {mode === "onboarding" ? (
          <>
            <label className="flex gap-2 items-center text-[13px] cursor-pointer">
              <input
                type="checkbox"
                checked={checked}
                onChange={(event) => setChecked(event.target.checked)}
                className="accent-[var(--color-accent)]"
              />
              I understand and accept the above
            </label>
            <div className="flex justify-end">
              <button
                type="button"
                disabled={!checked}
                onClick={onAccept}
                className={`px-5 py-2 rounded-[8px] border-none text-white text-[13px] font-semibold transition-opacity ${
                  checked
                    ? "bg-[var(--color-accent)] cursor-pointer hover:opacity-90"
                    : "bg-[var(--color-accent)] opacity-50 cursor-not-allowed"
                }`}
              >
                Continue
              </button>
            </div>
          </>
        ) : (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-[8px] border-none bg-[var(--color-accent)] text-white text-[13px] font-semibold cursor-pointer hover:opacity-90 transition-opacity"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
