from fastapi import APIRouter, Request
from pydantic import BaseModel

from app.downloader.engine import QueueFullError
from app.errors import ApiError

router = APIRouter()


class DownloadRequest(BaseModel):
    url: str
    calidad_kbps: int | None = None


@router.post("/download", status_code=201)
async def start_download(payload: DownloadRequest, request: Request):
    download_queue = request.app.state.download_queue
    try:
        return download_queue.enqueue(payload.url, payload.calidad_kbps)
    except QueueFullError as exc:
        raise ApiError(429, "cola_llena", "La cola de descargas está llena") from exc


@router.get("/download/queue")
async def get_queue(request: Request):
    return {"items": request.app.state.download_queue.list_items()}


@router.delete("/download/{song_id}")
async def cancel_download(song_id: str, request: Request):
    download_queue = request.app.state.download_queue
    item = download_queue.get_item(song_id)
    if not item:
        raise ApiError(404, "no_encontrado", "Descarga no encontrada")
    if item["status"] != "queued":
        raise ApiError(409, "conflicto", "La descarga ya está en curso o finalizada")
    download_queue.cancel(song_id)
    return {"cancelled": True}
