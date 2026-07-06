"""Importación manual de archivos MP3 existentes (arrastrar y soltar o selector nativo)."""

from pathlib import Path

from app.db import DB_LOCK
from app.library.repository import find_by_ruta, insert_cancion, set_fields
from app.library.tags import file_hash, read_tags


def import_files(conn, rutas: list[str]) -> dict:
    importadas = 0
    actualizadas = 0
    errores = []

    for ruta_str in rutas:
        path = Path(ruta_str)

        if path.suffix.lower() != ".mp3":
            errores.append({"ruta": ruta_str, "kind": "formato_no_soportado"})
            continue
        if not path.exists():
            errores.append({"ruta": ruta_str, "kind": "archivo_no_encontrado"})
            continue

        ruta_normalizada = str(path.resolve())
        tags = read_tags(path)
        hash_archivo = file_hash(path)

        with DB_LOCK:
            existente = find_by_ruta(conn, ruta_normalizada)
            if existente:
                set_fields(
                    conn,
                    existente["id"],
                    titulo=tags["titulo"],
                    artista=tags["artista"],
                    album=tags["album"],
                    duracion_segundos=tags["duracion_segundos"],
                    hash_archivo=hash_archivo,
                    activo=1,
                )
                actualizadas += 1
            else:
                # Importación manual: el usuario ya eligió el archivo a propósito,
                # no se fuerza revisión aunque falten título/artista.
                insert_cancion(
                    conn,
                    titulo=tags["titulo"],
                    artista=tags["artista"],
                    album=tags["album"],
                    ruta_archivo=ruta_normalizada,
                    duracion_segundos=tags["duracion_segundos"],
                    plataforma_origen="importado",
                    url_origen=None,
                    calidad_kbps=None,
                    revisado=True,
                    hash_archivo=hash_archivo,
                )
                importadas += 1

    return {"importadas": importadas, "actualizadas": actualizadas, "errores": errores}
