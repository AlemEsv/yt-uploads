async function request(baseUrl, path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const error = data?.error ?? { kind: "error_desconocido", message: "Error de red" };
    throw Object.assign(new Error(error.message), { kind: error.kind });
  }
  return data;
}

export function createApiClient(baseUrl) {
  return {
    startDownload: (url, calidadKbps) =>
      request(baseUrl, "/download", {
        method: "POST",
        body: JSON.stringify({ url, calidad_kbps: calidadKbps ?? undefined }),
      }),
    patchLibrarySong: (songId, updates) =>
      request(baseUrl, `/library/${songId}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      }),
    coverUrl: (songId) => `${baseUrl}/library/${songId}/cover`,
    streamUrl: (songId) => `${baseUrl}/library/${songId}/stream`,
    listLibrary: (params = {}) => {
      const query = new URLSearchParams(
        Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")),
      );
      const qs = query.toString();
      return request(baseUrl, `/library${qs ? `?${qs}` : ""}`);
    },
    deleteLibrarySong: (songId, borrarArchivo = false) =>
      request(baseUrl, `/library/${songId}?borrar_archivo=${borrarArchivo}`, { method: "DELETE" }),
    importFiles: (rutas) =>
      request(baseUrl, "/library/import", { method: "POST", body: JSON.stringify({ rutas }) }),
    scanLibrary: (directorio) =>
      request(baseUrl, "/library/scan", { method: "POST", body: JSON.stringify({ directorio: directorio ?? null }) }),
    listFavorites: () => request(baseUrl, "/favorites"),
    addFavorite: (songId) => request(baseUrl, `/favorites/${songId}`, { method: "POST" }),
    removeFavorite: (songId) => request(baseUrl, `/favorites/${songId}`, { method: "DELETE" }),
    registerHistory: (songId) =>
      request(baseUrl, "/history", { method: "POST", body: JSON.stringify({ song_id: songId }) }),
  };
}
