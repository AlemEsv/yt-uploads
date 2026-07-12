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

if (isMini) {
  document.documentElement.classList.add("mini-mode");
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>{isMini ? <MiniPlayerApp /> : <App />}</React.StrictMode>,
);
