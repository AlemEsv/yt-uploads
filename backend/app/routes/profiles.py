from fastapi import APIRouter, Request
from pydantic import BaseModel

from app.config_store import set_value
from app.db import DB_LOCK
from app.errors import ApiError
from app.profiles.repository import create_perfil, delete_perfil, get_perfil, list_perfiles, update_perfil

router = APIRouter()


class ProfileCreateRequest(BaseModel):
    nombre: str
    paleta_colores: dict
    criterio_activacion: dict | None = None


class ProfilePatchRequest(BaseModel):
    nombre: str | None = None
    paleta_colores: dict | None = None
    criterio_activacion: dict | None = None


@router.get("/profiles")
async def list_profiles(request: Request):
    conn = request.app.state.db
    with DB_LOCK:
        return {"items": list_perfiles(conn)}


@router.post("/profiles", status_code=201)
async def create_profile(payload: ProfileCreateRequest, request: Request):
    conn = request.app.state.db
    with DB_LOCK:
        perfil_id = create_perfil(
            conn,
            nombre=payload.nombre,
            paleta_colores=payload.paleta_colores,
            criterio_activacion=payload.criterio_activacion,
        )
        return get_perfil(conn, perfil_id)


@router.patch("/profiles/{perfil_id}")
async def patch_profile(perfil_id: int, payload: ProfilePatchRequest, request: Request):
    conn = request.app.state.db
    updates = payload.model_dump(exclude_unset=True)
    with DB_LOCK:
        existing = get_perfil(conn, perfil_id)
        if not existing:
            raise ApiError(404, "no_encontrado", "Perfil no encontrado")
        if updates:
            update_perfil(conn, perfil_id, **updates)
        return get_perfil(conn, perfil_id)


@router.delete("/profiles/{perfil_id}")
async def delete_profile(perfil_id: int, request: Request):
    conn = request.app.state.db
    with DB_LOCK:
        try:
            deleted = delete_perfil(conn, perfil_id)
        except ValueError as exc:
            raise ApiError(409, "conflicto", str(exc)) from exc
    if not deleted:
        raise ApiError(404, "no_encontrado", "Perfil no encontrado")
    return {"deleted": True}


@router.post("/profiles/{perfil_id}/activate")
async def activate_profile(perfil_id: int, request: Request):
    conn = request.app.state.db
    ws_manager = request.app.state.ws_manager
    with DB_LOCK:
        perfil = get_perfil(conn, perfil_id)
        if not perfil:
            raise ApiError(404, "no_encontrado", "Perfil no encontrado")
        set_value(conn, "perfil_tematico_activo", str(perfil_id))

    await ws_manager.broadcast(
        "profile_activated",
        {
            "profile_id": perfil["id"],
            "nombre": perfil["nombre"],
            "paleta_colores": perfil["paleta_colores"],
            "origen": "manual",
        },
    )
    return {"activated_profile_id": perfil_id}
