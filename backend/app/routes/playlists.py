from fastapi import APIRouter, Request
from pydantic import BaseModel, Field

from app.db import DB_LOCK
from app.errors import ApiError
from app.library.repository import get_cancion
from app.playlists.repository import (
    add_song,
    create_playlist,
    delete_playlist,
    get_playlist,
    list_playlists,
    remove_song,
    rename_playlist,
)

router = APIRouter()


class PlaylistPayload(BaseModel):
    nombre: str = Field(min_length=1, max_length=100)


class PlaylistSongPayload(BaseModel):
    song_id: int


@router.get("/playlists")
async def get_playlists(request: Request):
    conn = request.app.state.db
    with DB_LOCK:
        return {"items": list_playlists(conn)}


@router.post("/playlists", status_code=201)
async def post_playlist(payload: PlaylistPayload, request: Request):
    conn = request.app.state.db
    with DB_LOCK:
        playlist_id = create_playlist(conn, payload.nombre.strip())
        return get_playlist(conn, playlist_id)


@router.get("/playlists/{playlist_id}")
async def get_playlist_detail(playlist_id: int, request: Request):
    conn = request.app.state.db
    with DB_LOCK:
        playlist = get_playlist(conn, playlist_id)
    if not playlist:
        raise ApiError(404, "no_encontrado", "Playlist no encontrada")
    return playlist


@router.patch("/playlists/{playlist_id}")
async def patch_playlist(playlist_id: int, payload: PlaylistPayload, request: Request):
    conn = request.app.state.db
    with DB_LOCK:
        if not rename_playlist(conn, playlist_id, payload.nombre.strip()):
            raise ApiError(404, "no_encontrado", "Playlist no encontrada")
        return get_playlist(conn, playlist_id)


@router.delete("/playlists/{playlist_id}")
async def remove_playlist(playlist_id: int, request: Request):
    conn = request.app.state.db
    with DB_LOCK:
        if not delete_playlist(conn, playlist_id):
            raise ApiError(404, "no_encontrado", "Playlist no encontrada")
    return {"deleted": True}


@router.post("/playlists/{playlist_id}/songs", status_code=201)
async def add_playlist_song(playlist_id: int, payload: PlaylistSongPayload, request: Request):
    conn = request.app.state.db
    with DB_LOCK:
        if not get_playlist(conn, playlist_id):
            raise ApiError(404, "no_encontrado", "Playlist no encontrada")
        if not get_cancion(conn, payload.song_id):
            raise ApiError(404, "no_encontrado", "Canción no encontrada")
        add_song(conn, playlist_id, payload.song_id)
        return get_playlist(conn, playlist_id)


@router.delete("/playlists/{playlist_id}/songs/{song_id}")
async def remove_playlist_song(playlist_id: int, song_id: int, request: Request):
    conn = request.app.state.db
    with DB_LOCK:
        if not remove_song(conn, playlist_id, song_id):
            raise ApiError(404, "no_encontrado", "La canción no está en esta playlist")
        return get_playlist(conn, playlist_id)
