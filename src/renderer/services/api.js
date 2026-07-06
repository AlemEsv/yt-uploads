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
  };
}
