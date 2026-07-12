import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useApi } from "../hooks/useApi.js";
import { useWebSocketEvent } from "./WebSocketContext.jsx";

const ThemeContext = createContext(null);

const DEFAULT_ACCENT = "#c30dd2";
const DEFAULT_ACCENT_SOFT = "rgba(195, 13, 210, 0.25)";

function applyPalette(palette) {
  const root = document.documentElement;
  root.style.setProperty("--color-accent", palette?.accent ?? DEFAULT_ACCENT);
  root.style.setProperty("--color-accent-soft", palette?.accentSoft ?? DEFAULT_ACCENT_SOFT);
}

export function ThemeProvider({ children }) {
  const api = useApi();
  const [profiles, setProfiles] = useState([]);
  const [activeProfileId, setActiveProfileId] = useState(null);
  const [mode, setMode] = useState("manual");
  const [suggestion, setSuggestion] = useState(null);

  const refetchProfiles = useCallback(async () => {
    if (!api) return;
    const { items } = await api.listProfiles();
    setProfiles(items);
  }, [api]);

  useEffect(() => {
    refetchProfiles();
  }, [refetchProfiles]);

  useEffect(() => {
    if (!api) return;
    api.getSettings().then((settings) => {
      setMode(settings.modo_mood_engine);
      if (settings.perfil_tematico_activo) {
        setActiveProfileId(Number(settings.perfil_tematico_activo));
      }
    });
  }, [api]);

  useEffect(() => {
    const active = profiles.find((p) => p.id === activeProfileId);
    if (active) {
      applyPalette(active.paleta_colores);
    }
  }, [profiles, activeProfileId]);

  useWebSocketEvent(
    "profile_activated",
    useCallback((data) => {
      setActiveProfileId(data.profile_id);
      applyPalette(data.paleta_colores);
    }, []),
  );

  useWebSocketEvent(
    "mood_suggestion",
    useCallback((data) => setSuggestion(data), []),
  );

  async function activateProfile(id) {
    if (!api) return;
    await api.activateProfile(id);
    setActiveProfileId(id);
  }

  async function setMoodMode(nextMode) {
    if (!api) return;
    await api.putSettings({ modo_mood_engine: nextMode });
    setMode(nextMode);
  }

  async function createProfile(data) {
    if (!api) return;
    await api.createProfile(data);
    await refetchProfiles();
  }

  async function updateProfile(id, data) {
    if (!api) return;
    await api.patchProfile(id, data);
    await refetchProfiles();
  }

  async function removeProfile(id) {
    if (!api) return;
    await api.deleteProfile(id);
    await refetchProfiles();
  }

  const value = {
    profiles,
    activeProfileId,
    mode,
    suggestion,
    activateProfile,
    setMoodMode,
    createProfile,
    updateProfile,
    removeProfile,
    dismissSuggestion: () => setSuggestion(null),
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme debe usarse dentro de ThemeProvider");
  }
  return ctx;
}
