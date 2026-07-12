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
  document.documentElement.dataset.theme = localStorage.getItem(THEME_KEY) ?? "oscuro";
  // El main window escribe en localStorage al cambiar el tema; "storage" solo
  // dispara en OTRAS ventanas del mismo origen, así que la mini se mantiene
  // sincronizada aunque el cambio ocurra mientras está abierta.
  window.addEventListener("storage", (event) => {
    if (event.key === THEME_KEY && event.newValue) {
      document.documentElement.dataset.theme = event.newValue;
    }
  });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>{isMini ? <MiniPlayerApp /> : <App />}</React.StrictMode>,
);
