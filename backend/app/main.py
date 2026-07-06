import asyncio
import json
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config_store import get_download_dir
from app.db import get_connection
from app.downloader.engine import DownloadQueue
from app.errors import ApiError
from app.routes import download, favorites, health, history, library, profiles, settings
from app.websocket import ConnectionManager


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.db = get_connection()
    app.state.ws_manager = ConnectionManager()
    app.state.download_queue = DownloadQueue(
        ws_manager=app.state.ws_manager,
        get_db=lambda: app.state.db,
        get_download_dir=lambda: get_download_dir(app.state.db),
    )
    app.state.download_queue.bind_loop(asyncio.get_running_loop())

    host = getattr(app.state, "host", "127.0.0.1")
    port = getattr(app.state, "port", 8765)
    # Handshake leído por Electron (src/main/backend-process.js) para conocer host/puerto reales.
    print(f"SOUNDDOCK_BACKEND_READY {json.dumps({'host': host, 'port': port})}", flush=True)
    yield

    app.state.db.close()


app = FastAPI(title="SoundDock Backend", lifespan=lifespan)

# El backend solo escucha en 127.0.0.1 (nunca expuesto en la red); el renderer
# de Electron llega desde otro origen (localhost:5173 en dev, file:// empaquetado),
# así que el fetch() del frontend necesita CORS habilitado para poder hablar con él.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(download.router)
app.include_router(library.router)
app.include_router(favorites.router)
app.include_router(history.router)
app.include_router(profiles.router)
app.include_router(settings.router)


@app.exception_handler(ApiError)
async def api_error_handler(request: Request, exc: ApiError):
    return JSONResponse(status_code=exc.status_code, content={"error": {"kind": exc.kind, "message": exc.message}})


@app.exception_handler(RequestValidationError)
async def validation_error_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"error": {"kind": "solicitud_invalida", "message": str(exc)}},
    )


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await app.state.ws_manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        app.state.ws_manager.disconnect(websocket)
