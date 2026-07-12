import React, { createContext, useContext, useEffect, useState } from "react";
import { useApi } from "../hooks/useApi.js";

const AppearanceContext = createContext(null);

const THEME_KEY = "sounddock:tema";
const NAME_KEY = "sounddock:nombreUsuario";
const ACCENT_KEY = "sounddock:colorAcento";
const DEFAULT_ACCENT = "#0ea5e9";

function applyTheme(tema) {
  document.documentElement.dataset.theme = tema;
}

function hexToRgba(hex, alpha) {
  const match = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!match) return hex;
  const [r, g, b] = match.slice(1).map((part) => parseInt(part, 16));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function applyAccent(hex) {
  document.documentElement.style.setProperty("--color-accent", hex);
  document.documentElement.style.setProperty("--color-accent-soft", hexToRgba(hex, 0.2));
}

export function AppearanceProvider({ children }) {
  const api = useApi();
  const [tema, setTemaState] = useState(() => localStorage.getItem(THEME_KEY) ?? "oscuro");
  const [nombreUsuario, setNombreUsuarioState] = useState(
    () => localStorage.getItem(NAME_KEY) ?? "Usuario",
  );
  const [colorAcento, setColorAcentoState] = useState(
    () => localStorage.getItem(ACCENT_KEY) ?? DEFAULT_ACCENT,
  );

  useEffect(() => {
    applyTheme(tema);
  }, [tema]);

  useEffect(() => {
    applyAccent(colorAcento);
  }, [colorAcento]);

  useEffect(() => {
    if (!api) return;
    api.getSettings().then((settings) => {
      if (settings.tema) {
        setTemaState(settings.tema);
        localStorage.setItem(THEME_KEY, settings.tema);
      }
      if (settings.nombre_usuario) {
        setNombreUsuarioState(settings.nombre_usuario);
        localStorage.setItem(NAME_KEY, settings.nombre_usuario);
      }
      if (settings.color_acento) {
        setColorAcentoState(settings.color_acento);
        localStorage.setItem(ACCENT_KEY, settings.color_acento);
      }
    });
  }, [api]);

  async function setTema(valor) {
    setTemaState(valor);
    localStorage.setItem(THEME_KEY, valor);
    applyTheme(valor);
    if (api) await api.putSettings({ tema: valor });
  }

  async function setNombreUsuario(valor) {
    setNombreUsuarioState(valor);
    localStorage.setItem(NAME_KEY, valor);
    if (api) await api.putSettings({ nombre_usuario: valor });
  }

  async function setColorAcento(valor) {
    setColorAcentoState(valor);
    localStorage.setItem(ACCENT_KEY, valor);
    applyAccent(valor);
    if (api) await api.putSettings({ color_acento: valor });
  }

  return (
    <AppearanceContext.Provider
      value={{
        tema,
        setTema,
        nombreUsuario,
        setNombreUsuario,
        colorAcento,
        setColorAcento,
      }}
    >
      {children}
    </AppearanceContext.Provider>
  );
}

export function useAppearance() {
  const ctx = useContext(AppearanceContext);
  if (!ctx) throw new Error("useAppearance must be used within AppearanceProvider");
  return ctx;
}
