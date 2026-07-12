import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import MiniPlayerApp from "./MiniPlayerApp.jsx";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import "@fontsource/poppins/400-italic.css";
import "@fontsource/roboto/500.css";
import "./styles/global.css";

const isMini = window.location.hash === "#mini";
const THEME_KEY = "sounddock:tema";

if (isMini) {
  document.documentElement.classList.add("mini-mode");

  function syncMiniTheme(tema) {
    document.documentElement.dataset.theme = tema;
    // La ventana en sí sigue siendo opaca (no realmente transparente, ver
    // fix anterior de esquinas) — si su backgroundColor no coincide con el
    // tema actual, el pequeño desajuste entre el radio de la ventana y el
    // radio del contenido deja ver un borde del color equivocado.
    const bg = getComputedStyle(document.documentElement)
      .getPropertyValue("--color-player-bg")
      .trim();
    window.sounddock?.setMiniBackground(bg);
  }

  syncMiniTheme(localStorage.getItem(THEME_KEY) ?? "oscuro");

  // El main window escribe en localStorage al cambiar el tema; "storage" solo
  // dispara en OTRAS ventanas del mismo origen, así que la mini se mantiene
  // sincronizada aunque el cambio ocurra mientras está abierta.
  window.addEventListener("storage", (event) => {
    if (event.key === THEME_KEY && event.newValue) {
      syncMiniTheme(event.newValue);
    }
  });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>{isMini ? <MiniPlayerApp /> : <App />}</React.StrictMode>,
);
