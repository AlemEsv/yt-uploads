from fastapi import APIRouter, Request
from pydantic import BaseModel

from app.config_store import get_download_dir, get_value, set_value
from app.db import DB_LOCK

router = APIRouter()

DEFAULTS = {
    "calidad_audio_kbps": "320",
}


class SettingsPayload(BaseModel):
    directorio_descarga: str | None = None
    calidad_audio_kbps: int | None = None


def _read_settings(conn) -> dict:
    return {
        "directorio_descarga": str(get_download_dir(conn)),
        "calidad_audio_kbps": int(get_value(conn, "calidad_audio_kbps", DEFAULTS["calidad_audio_kbps"])),
    }


@router.get("/settings")
async def get_settings(request: Request):
    conn = request.app.state.db
    with DB_LOCK:
        return _read_settings(conn)


@router.put("/settings")
async def put_settings(payload: SettingsPayload, request: Request):
    conn = request.app.state.db
    updates = payload.model_dump(exclude_unset=True)
    with DB_LOCK:
        for key, value in updates.items():
            set_value(conn, key, str(value))
        return _read_settings(conn)
