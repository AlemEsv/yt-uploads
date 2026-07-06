"""App FastAPI de SoundDock: crea la app, monta routers, y anuncia el puerto por stdout."""

import json
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.db import get_connection
from app.routes import health


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.db = get_connection()

    host = getattr(app.state, "host", "127.0.0.1")
    port = getattr(app.state, "port", 8765)
    # Handshake leído por Electron (src/main/backend-process.js) para conocer host/puerto reales.
    print(f"SOUNDDOCK_BACKEND_READY {json.dumps({'host': host, 'port': port})}", flush=True)
    yield

    app.state.db.close()


app = FastAPI(title="SoundDock Backend", lifespan=lifespan)
app.include_router(health.router)
