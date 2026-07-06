from fastapi import APIRouter

router = APIRouter()

APP_VERSION = "0.1.0"


@router.get("/health")
async def health() -> dict:
    return {"status": "ok", "version": APP_VERSION}
