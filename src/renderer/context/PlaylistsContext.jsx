import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useApi } from "../hooks/useApi.js";

const PlaylistsContext = createContext(null);

export function PlaylistsProvider({ children }) {
  const api = useApi();
  const [playlists, setPlaylists] = useState([]);

  const refetch = useCallback(async () => {
    if (!api) return;
    const { items } = await api.listPlaylists();
    setPlaylists(items);
  }, [api]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  async function createPlaylist(nombre) {
    if (!api) return null;
    const playlist = await api.createPlaylist(nombre);
    await refetch();
    return playlist;
  }

  async function renamePlaylist(playlistId, nombre) {
    if (!api) return;
    await api.renamePlaylist(playlistId, nombre);
    await refetch();
  }

  async function deletePlaylist(playlistId) {
    if (!api) return;
    await api.deletePlaylist(playlistId);
    await refetch();
  }

  async function addSong(playlistId, songId) {
    if (!api) return;
    await api.addPlaylistSong(playlistId, songId);
    await refetch();
  }

  async function removeSong(playlistId, songId) {
    if (!api) return;
    await api.removePlaylistSong(playlistId, songId);
    await refetch();
  }

  const value = {
    playlists,
    refetch,
    createPlaylist,
    renamePlaylist,
    deletePlaylist,
    addSong,
    removeSong,
  };

  return <PlaylistsContext.Provider value={value}>{children}</PlaylistsContext.Provider>;
}

export function usePlaylists() {
  const ctx = useContext(PlaylistsContext);
  if (!ctx) {
    throw new Error("usePlaylists debe usarse dentro de PlaylistsProvider");
  }
  return ctx;
}
