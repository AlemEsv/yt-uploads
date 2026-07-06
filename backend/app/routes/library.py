from fastapi import APIRouter, Request
from pydantic import BaseModel

from app.db import DB_LOCK
from app.errors import ApiError
from app.library.repository import get_cancion, update_cancion

router = APIRouter()


class LibraryPatchRequest(BaseModel):
    titulo: str | None = None
    artista: str | None = None
    genero: str | None = None
    album: str | None = None


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
