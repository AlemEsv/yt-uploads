import React, { createContext, useContext, useEffect, useState } from "react";
import { useApi } from "../hooks/useApi.js";

const AppearanceContext = createContext(null);

const THEME_KEY = "sounddock:tema";
const NAME_KEY = "sounddock:nombreUsuario";

function applyTheme(tema) {
  document.documentElement.dataset.theme = tema;
}

export function AppearanceProvider({ children }) {
  const api = useApi();
  const [tema, setTemaState] = useState(() => localStorage.getItem(THEME_KEY) ?? "oscuro");
  const [nombreUsuario, setNombreUsuarioState] = useState(
    () => localStorage.getItem(NAME_KEY) ?? "Usuario",
  );

  useEffect(() => {
    applyTheme(tema);
  }, [tema]);

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

  return (
    <AppearanceContext.Provider value={{ tema, setTema, nombreUsuario, setNombreUsuario }}>
      {children}
    </AppearanceContext.Provider>
  );
}

export function useAppearance() {
  const ctx = useContext(AppearanceContext);
  if (!ctx) throw new Error("useAppearance must be used within AppearanceProvider");
  return ctx;
}
