"""Clasificación cerrada de errores de descarga (kind) a partir de excepciones de yt-dlp/ffmpeg."""

import errno
from urllib.error import URLError

ERROR_MESSAGES = {
    "url_invalida": "La URL no es válida o no es de una plataforma soportada.",
    "video_privado": "Este video es privado y no se puede descargar.",
    "video_eliminado": "Este video fue eliminado o ya no existe.",
    "restringido_edad_region": "Este contenido está restringido por edad o región.",
    "sin_audio": "No se encontró una pista de audio disponible para este contenido.",
    "error_red": "Error de conexión. Verifica tu red e inténtalo de nuevo.",
    "disco_sin_espacio_permisos": "No se pudo guardar el archivo (sin espacio en disco o sin permisos).",
    "error_desconocido": "Ocurrió un error inesperado al descargar.",
}


class ClassifiedDownloadError(Exception):
    def __init__(self, kind: str, message: str | None = None):
        super().__init__(message or ERROR_MESSAGES.get(kind, ERROR_MESSAGES["error_desconocido"]))
        self.kind = kind
        self.message = message or ERROR_MESSAGES.get(kind, ERROR_MESSAGES["error_desconocido"])


def _kind_for_text(text: str) -> str | None:
    lowered = text.lower()

    if "private video" in lowered or "private" in lowered:
        return "video_privado"
    if "video unavailable" in lowered or "has been removed" in lowered or "no longer available" in lowered:
        return "video_eliminado"
    if (
        "sign in to confirm your age" in lowered
        or "age-restricted" in lowered
        or "not available in your country" in lowered
        or "blocked it in your country" in lowered
    ):
        return "restringido_edad_region"
    if "no audio" in lowered or "requested format is not available" in lowered:
        return "sin_audio"
    if "unsupported url" in lowered or "is not a valid url" in lowered:
        return "url_invalida"
    return None


def classify_exception(exc: Exception) -> ClassifiedDownloadError:
    if isinstance(exc, ClassifiedDownloadError):
        return exc

    if isinstance(exc, PermissionError) or (isinstance(exc, OSError) and exc.errno == errno.ENOSPC):
        return ClassifiedDownloadError("disco_sin_espacio_permisos")

    if isinstance(exc, (URLError, ConnectionError, TimeoutError)):
        return ClassifiedDownloadError("error_red")

    kind = _kind_for_text(str(exc))
    if kind:
        return ClassifiedDownloadError(kind)

    return ClassifiedDownloadError("error_desconocido")
