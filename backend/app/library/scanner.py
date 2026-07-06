"""Escaneo del directorio configurado: detecta canciones nuevas, modificadas o desaparecidas."""

from pathlib import Path
from typing import Callable

from app.db import DB_LOCK
from app.library.repository import find_by_ruta, insert_cancion, list_active_paths, mark_inactive, set_fields
from app.library.tags import file_hash, read_tags


def scan_directory(conn, directory: Path, on_progress: Callable[[int, int], None] | None = None) -> dict:
    archivos = list(directory.rglob("*.mp3")) if directory.exists() else []
    total = len(archivos)
    nuevas = 0
    actualizadas = 0
    rutas_en_disco = set()

    for index, path in enumerate(archivos, start=1):
        ruta_normalizada = str(path.resolve())
        rutas_en_disco.add(ruta_normalizada)
        hash_archivo = file_hash(path)

        with DB_LOCK:
            existente = find_by_ruta(conn, ruta_normalizada)
            if existente is None:
                tags = read_tags(path)
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
                nuevas += 1
            elif existente["hash_archivo"] != hash_archivo or not existente["activo"]:
                tags = read_tags(path)
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

        if on_progress:
            on_progress(index, total)

    marcadas_inactivas = 0
    directory_resolved = str(directory.resolve())
    with DB_LOCK:
        for cancion in list_active_paths(conn):
            ruta = str(Path(cancion["ruta_archivo"]).resolve())
            if ruta.startswith(directory_resolved) and ruta not in rutas_en_disco:
                mark_inactive(conn, cancion["id"])
                marcadas_inactivas += 1

    return {"nuevas": nuevas, "actualizadas": actualizadas, "marcadas_inactivas": marcadas_inactivas}
