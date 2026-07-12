import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useApi } from "../hooks/useApi.js";
import { useWebSocketEvent } from "./WebSocketContext.jsx";

const LibraryContext = createContext(null);

export function LibraryProvider({ children }) {
  const api = useApi();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState(null);
  const [genreFilter, setGenreFilter] = useState(null);

  const refetch = useCallback(async () => {
    if (!api) return;
    setLoading(true);
    try {
      const { items } = await api.listLibrary({ limit: 200 });
      setSongs(items);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useWebSocketEvent(
    "download_completed",
    useCallback((data) => {
      setSongs((current) => [data.cancion, ...current.filter((s) => s.id !== data.cancion.id)]);
    }, []),
  );

  useWebSocketEvent(
    "library_scan_completed",
    useCallback(() => refetch(), [refetch]),
  );

  async function toggleFavorite(song) {
    if (!api) return;
    const next = !song.es_favorito;
    setSongs((current) => current.map((s) => (s.id === song.id ? { ...s, es_favorito: next } : s)));
    try {
      if (next) {
        await api.addFavorite(song.id);
      } else {
        await api.removeFavorite(song.id);
      }
    } catch {
      setSongs((current) =>
        current.map((s) => (s.id === song.id ? { ...s, es_favorito: !next } : s)),
      );
    }
  }

  async function removeSong(songId, borrarArchivo = false) {
    if (!api) return;
    await api.deleteLibrarySong(songId, borrarArchivo);
    setSongs((current) => current.filter((s) => s.id !== songId));
  }

  async function importFiles(rutas) {
    if (!api || rutas.length === 0) return null;
    const result = await api.importFiles(rutas);
    await refetch();
    return result;
  }

  async function scanLibrary() {
    if (!api) return;
    await api.scanLibrary();
  }

  function applyUpdate(updatedSong) {
    setSongs((current) => current.map((s) => (s.id === updatedSong.id ? updatedSong : s)));
  }

  const value = {
    songs,
    loading,
    refetch,
    toggleFavorite,
    removeSong,
    importFiles,
    scanLibrary,
    applyUpdate,
    searchQuery,
    setSearchQuery,
    platformFilter,
    setPlatformFilter,
    genreFilter,
    setGenreFilter,
  };

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) {
    throw new Error("useLibrary debe usarse dentro de LibraryProvider");
  }
  return ctx;
}
