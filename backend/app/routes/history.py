from fastapi import APIRouter, Request
from pydantic import BaseModel

from app.db import DB_LOCK
from app.errors import ApiError
from app.history.repository import get_stats, insert_reproduccion, list_historial
from app.library.repository import get_cancion
from app.mood_engine import evaluate as evaluate_mood

router = APIRouter()


class HistoryRequest(BaseModel):
    song_id: int


@router.post("/history", status_code=201)
async def register_history(payload: HistoryRequest, request: Request):
    conn = request.app.state.db
    ws_manager = request.app.state.ws_manager

    with DB_LOCK:
        cancion = get_cancion(conn, payload.song_id)
        if not cancion:
            raise ApiError(404, "no_encontrado", "Canción no encontrada")
        result = insert_reproduccion(conn, payload.song_id)
        eventos = evaluate_mood(conn)

    for evento, ev_payload in eventos:
        await ws_manager.broadcast(evento, ev_payload)

    return result


@router.get("/history/stats")
async def get_history_stats(request: Request, ventana_dias: int = 7):
    conn = request.app.state.db
    with DB_LOCK:
        return get_stats(conn, ventana_dias)


@router.get("/history")
async def get_history(request: Request, limit: int = 50, offset: int = 0):
    conn = request.app.state.db
    limit = max(1, min(limit, 200))
    with DB_LOCK:
        items = list_historial(conn, limit=limit, offset=offset)
    return {"items": items}
