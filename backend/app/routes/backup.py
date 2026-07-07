import shutil
from pathlib import Path

from fastapi import APIRouter, Request
from fastapi.concurrency import run_in_threadpool
from pydantic import BaseModel

from app.backup import export_database, safety_backup_path, validate_backup_file
from app.config_store import get_download_dir
from app.db import DB_LOCK, get_connection
from app.errors import ApiError
from app.library.scanner import scan_directory
from app.paths import db_path

router = APIRouter()


class ExportRequest(BaseModel):
    destino: str


class ImportRequest(BaseModel):
    origen: str
    modo: str = "reemplazar"


@router.post("/backup/export")
async def export_backup(payload: ExportRequest, request: Request):
    conn = request.app.state.db
    destino = Path(payload.destino)
    with DB_LOCK:
        tamano = export_database(conn, destino)
    return {"exportado_a": str(destino), "tamano_bytes": tamano}


@router.post("/backup/import")
async def import_backup(payload: ImportRequest, request: Request):
    if payload.modo != "reemplazar":
        raise ApiError(
            422, "solicitud_invalida", "Solo se soporta el modo 'reemplazar'"
        )

    origen = Path(payload.origen)
    try:
        validate_backup_file(origen)
    except ValueError as exc:
        raise ApiError(422, "backup_invalido", str(exc)) from exc

    with DB_LOCK:
        request.app.state.db.close()
        shutil.copy2(db_path(), safety_backup_path())
        shutil.copy2(origen, db_path())
        request.app.state.db = get_connection()
        conn = request.app.state.db
        total = conn.execute("SELECT COUNT(*) FROM canciones").fetchone()[0]
        directorio = get_download_dir(conn)

    resultado_scan = await run_in_threadpool(scan_directory, conn, directorio)

    return {
        "restaurado": True,
        "modo": payload.modo,
        "canciones_totales": total,
        "rescan": resultado_scan,
    }
