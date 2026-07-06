export const ERROR_KIND_MAP = {
  url_invalida: {
    title: "Enlace inválido",
    message: "El enlace no corresponde a un video o pista soportada.",
  },
  video_privado: {
    title: "Video privado",
    message: "Este video es privado y no se puede descargar.",
  },
  video_eliminado: {
    title: "Video eliminado",
    message: "El contenido ya no existe en la plataforma de origen.",
  },
  restringido_edad_region: {
    title: "Contenido restringido",
    message: "Restringido por edad, región o derechos de autor.",
  },
  sin_audio: {
    title: "Sin pista de audio",
    message: "El contenido no tiene audio disponible para extraer.",
  },
  error_red: {
    title: "Error de red",
    message: "No se pudo conectar con la plataforma de origen. Revisa tu conexión.",
  },
  disco_sin_espacio_permisos: {
    title: "Error de almacenamiento",
    message: "No se pudo guardar el archivo. Verifica el espacio disponible en disco.",
  },
  error_desconocido: {
    title: "Error inesperado",
    message: "Ocurrió un problema al procesar la descarga.",
  },
};

export function resolveErrorKind(kind) {
  return ERROR_KIND_MAP[kind] ?? ERROR_KIND_MAP.error_desconocido;
}
