from fastapi import APIRouter, Request

from app.db import DB_LOCK
from app.errors import ApiError
from app.library.repository import get_cancion, list_favoritos, set_favorito, unset_favorito

router = APIRouter()


@router.post("/favorites/{cancion_id}", status_code=201)
async def add_favorite(cancion_id: int, request: Request):
    conn = request.app.state.db
    with DB_LOCK:
        existing = get_cancion(conn, cancion_id)
        if not existing:
            raise ApiError(404, "no_encontrado", "Canción no encontrada")
        set_favorito(conn, cancion_id)
    return {"id_cancion": cancion_id, "es_favorito": True}


@router.delete("/favorites/{cancion_id}")
async def remove_favorite(cancion_id: int, request: Request):
    conn = request.app.state.db
    with DB_LOCK:
        existing = get_cancion(conn, cancion_id)
        if not existing:
            raise ApiError(404, "no_encontrado", "Canción no encontrada")
        unset_favorito(conn, cancion_id)
    return {"id_cancion": cancion_id, "es_favorito": False}


@router.get("/favorites")
async def get_favorites(request: Request, limit: int = 50, offset: int = 0):
    conn = request.app.state.db
    limit = max(1, min(limit, 200))
    with DB_LOCK:
        items = list_favoritos(conn, limit=limit, offset=offset)
    return {"items": items}
