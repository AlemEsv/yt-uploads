"""Motor de descarga: worker thread único + cola FIFO, integra yt-dlp/ffmpeg/mutagen."""

import asyncio
import queue
import threading
import time
import uuid
from pathlib import Path

from yt_dlp import YoutubeDL

from app.db import DB_LOCK
from app.downloader.errors import classify_exception, ClassifiedDownloadError
from app.downloader.progress import parse_progress
from app.library.repository import get_cancion, insert_cancion
from app.metadata import write_tags
from app.paths import ffmpeg_path

MAX_QUEUE_SIZE = 10
DEFAULT_QUALITY_KBPS = 320
PROGRESS_THROTTLE_SECONDS = 0.5


class QueueFullError(Exception):
    pass


class DownloadQueue:
    def __init__(self, ws_manager, get_db, get_download_dir):
        self._queue = queue.Queue(maxsize=MAX_QUEUE_SIZE)
        self._ws_manager = ws_manager
        self._get_db = get_db
        self._get_download_dir = get_download_dir
        self._loop = None
        self._cancelled_ids = set()
        self._items_by_id = {}
        self._thread = threading.Thread(target=self._worker, daemon=True)
        self._thread.start()

    def bind_loop(self, loop: asyncio.AbstractEventLoop) -> None:
        self._loop = loop

    def enqueue(self, url: str, calidad_kbps: int | None) -> dict:
        song_id = f"q_{uuid.uuid4().hex[:12]}"
        item = {
            "song_id": song_id,
            "url": url,
            "calidad_kbps": calidad_kbps or DEFAULT_QUALITY_KBPS,
            "status": "queued",
            "progress": 0,
        }
        try:
            self._queue.put_nowait(item)
        except queue.Full as exc:
            raise QueueFullError() from exc

        self._items_by_id[song_id] = item
        position = self._queue.qsize()
        self._emit("download_queued", {"song_id": song_id, "url": url, "position": position})
        return {"song_id": song_id, "status": "queued", "position": position}

    def cancel(self, song_id: str) -> bool:
        item = self._items_by_id.get(song_id)
        if not item or item["status"] != "queued":
            return False
        self._cancelled_ids.add(song_id)
        item["status"] = "cancelled"
        self._emit("download_cancelled", {"song_id": song_id})
        return True

    def list_items(self) -> list[dict]:
        return list(self._items_by_id.values())

    def get_item(self, song_id: str) -> dict | None:
        return self._items_by_id.get(song_id)

    def _emit(self, event: str, payload: dict) -> None:
        if self._loop is None:
            return
        asyncio.run_coroutine_threadsafe(self._ws_manager.broadcast(event, payload), self._loop)

    def _worker(self) -> None:
        while True:
            item = self._queue.get()
            song_id = item["song_id"]

            if song_id in self._cancelled_ids:
                self._cancelled_ids.discard(song_id)
                self._queue.task_done()
                continue

            item["status"] = "downloading"
            self._emit("download_started", {"song_id": song_id, "url": item["url"]})

            try:
                cancion = self._run_download(item)
                item["status"] = "completed"
                self._emit(
                    "download_completed",
                    {"song_id": song_id, "cancion": cancion, "needs_review": not cancion["revisado"]},
                )
            except Exception as exc:  # clasificado antes de emitir, nunca se deja crudo
                classified = classify_exception(exc)
                item["status"] = "error"
                self._emit(
                    "download_error",
                    {"song_id": song_id, "kind": classified.kind, "message": classified.message},
                )
            finally:
                self._queue.task_done()

    def _run_download(self, item: dict) -> dict:
        song_id = item["song_id"]
        url = item["url"]
        quality = item["calidad_kbps"]
        download_dir = self._get_download_dir()
        download_dir.mkdir(parents=True, exist_ok=True)

        last_emit_at = {"t": 0.0}

        def progress_hook(d: dict) -> None:
            parsed = parse_progress(d)
            if not parsed:
                return

            now = time.monotonic()
            if parsed["status"] == "downloading" and now - last_emit_at["t"] < PROGRESS_THROTTLE_SECONDS:
                return
            last_emit_at["t"] = now

            if parsed["status"] == "converting":
                self._emit("download_postprocessing", {"song_id": song_id, "status": "converting"})
            else:
                self._emit(
                    "download_progress",
                    {
                        "song_id": song_id,
                        "progress": parsed["progress"],
                        "status": "downloading",
                        "eta_segundos": parsed.get("eta_segundos"),
                    },
                )

        ydl_opts = {
            "format": "bestaudio/best",
            "outtmpl": str(download_dir / "%(title)s.%(ext)s"),
            "ffmpeg_location": str(ffmpeg_path()),
            "quiet": True,
            "no_warnings": True,
            "noplaylist": True,
            "writethumbnail": True,
            "progress_hooks": [progress_hook],
            "postprocessors": [
                {"key": "FFmpegExtractAudio", "preferredcodec": "mp3", "preferredquality": str(quality)},
                {"key": "FFmpegThumbnailsConvertor", "format": "jpg"},
            ],
        }

        try:
            with YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=True)
                filepath = str(Path(ydl.prepare_filename(info)).with_suffix(".mp3"))
        except ClassifiedDownloadError:
            raise
        except Exception as exc:
            raise classify_exception(exc) from exc

        titulo, artista, revisado = write_tags(filepath, info)
        plataforma = "soundcloud" if "soundcloud.com" in url else "youtube"

        conn = self._get_db()
        with DB_LOCK:
            cancion_id = insert_cancion(
                conn,
                titulo=titulo,
                artista=artista,
                ruta_archivo=filepath,
                duracion_segundos=info.get("duration"),
                plataforma_origen=plataforma,
                url_origen=url,
                calidad_kbps=quality,
                revisado=revisado,
            )
            return get_cancion(conn, cancion_id)
