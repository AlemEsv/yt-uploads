import asyncio
from pathlib import Path

from fastapi import APIRouter, Request, Response
from fastapi.concurrency import run_in_threadpool
from mutagen.id3 import ID3
from pydantic import BaseModel

from app.config_store import get_download_dir
from app.db import DB_LOCK
from app.errors import ApiError
from app.library.importer import import_files
from app.library.repository import delete_cancion, get_cancion, list_canciones, count_canciones, update_cancion
from app.library.scanner import scan_directory

router = APIRouter()


class LibraryPatchRequest(BaseModel):
    titulo: str | None = None
    artista: str | None = None
    genero: str | None = None
    album: str | None = None


class ImportRequest(BaseModel):
    rutas: list[str]


class ScanRequest(BaseModel):
    directorio: str | None = None


@router.get("/library")
async def list_library(
    request: Request,
    q: str | None = None,
    artista: str | None = None,
    genero: str | None = None,
    plataforma: str | None = None,
    favoritos: bool = False,
    limit: int = 50,
    offset: int = 0,
    orden: str = "fecha_desc",
):
    conn = request.app.state.db
    limit = max(1, min(limit, 200))
    with DB_LOCK:
        items = list_canciones(
            conn,
            q=q,
            artista=artista,
            genero=genero,
            plataforma=plataforma,
            favoritos=favoritos,
            limit=limit,
            offset=offset,
            orden=orden,
        )
        total = count_canciones(conn, q=q, artista=artista, genero=genero, plataforma=plataforma, favoritos=favoritos)
    return {"items": items, "total": total}


@router.post("/library/import")
async def import_library_files(payload: ImportRequest, request: Request):
    conn = request.app.state.db
    return import_files(conn, payload.rutas)


@router.post("/library/scan")
async def scan_library(payload: ScanRequest, request: Request):
    conn = request.app.state.db
    ws_manager = request.app.state.ws_manager
    loop = asyncio.get_running_loop()
    directorio = Path(payload.directorio) if payload.directorio else get_download_dir(conn)

    def on_progress(procesados: int, total: int) -> None:
        asyncio.run_coroutine_threadsafe(
            ws_manager.broadcast("library_scan_progress", {"procesados": procesados, "total": total}),
            loop,
        )

    result = await run_in_threadpool(scan_directory, conn, directorio, on_progress)
    await ws_manager.broadcast("library_scan_completed", result)
    return result


@router.get("/library/{cancion_id}")
async def get_library_song(cancion_id: int, request: Request):
    conn = request.app.state.db
    with DB_LOCK:
        cancion = get_cancion(conn, cancion_id)
    if not cancion:
        raise ApiError(404, "no_encontrado", "Canción no encontrada")
    return cancion


@router.patch("/library/{cancion_id}")
async def patch_cancion(cancion_id: int, payload: LibraryPatchRequest, request: Request):
    conn = request.app.state.db
    updates = payload.model_dump(exclude_unset=True)

    with DB_LOCK:
        existing = get_cancion(conn, cancion_id)
        if not existing:
            raise ApiError(404, "no_encontrado", "Canción no encontrada")
        if updates:
            update_cancion(conn, cancion_id, **updates)
        return get_cancion(conn, cancion_id)


@router.delete("/library/{cancion_id}")
async def delete_library_song(cancion_id: int, request: Request, borrar_archivo: bool = False):
    conn = request.app.state.db
    with DB_LOCK:
        ruta_archivo = delete_cancion(conn, cancion_id)

    if ruta_archivo is None:
        raise ApiError(404, "no_encontrado", "Canción no encontrada")

    archivo_borrado = False
    if borrar_archivo:
        path = Path(ruta_archivo)
        if path.exists():
            path.unlink()
            archivo_borrado = True

    return {"deleted": True, "archivo_borrado": archivo_borrado}


@router.get("/library/{cancion_id}/cover")
async def get_library_song_cover(cancion_id: int, request: Request):
    conn = request.app.state.db
    with DB_LOCK:
        cancion = get_cancion(conn, cancion_id)
    if not cancion:
        raise ApiError(404, "no_encontrado", "Canción no encontrada")

    try:
        tags = ID3(cancion["ruta_archivo"])
        apics = tags.getall("APIC")
    except Exception:
        apics = []

    if not apics:
        raise ApiError(404, "sin_portada", "Esta canción no tiene portada embebida")

    apic = apics[0]
    return Response(content=apic.data, media_type=apic.mime)
