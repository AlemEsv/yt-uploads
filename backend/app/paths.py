"""Resolución de rutas — único punto de verdad para dev vs. empaquetado (PyInstaller)."""

import os
import sys
from pathlib import Path


def is_frozen() -> bool:
    """True cuando corre desde el ejecutable de PyInstaller."""
    return getattr(sys, "frozen", False)


def base_dir() -> Path:
    """Carpeta del .exe empaquetado en producción, o la raíz del repo en desarrollo."""
    if is_frozen():
        return Path(sys.executable).parent
    return Path(__file__).resolve().parents[2]


def ffmpeg_path() -> Path:
    """Carpeta que contiene ffmpeg.exe/ffprobe.exe/ffplay.exe."""
    return base_dir() / "ffmpeg" / "bin"


def data_dir() -> Path:
    """Carpeta de datos de la app: %APPDATA%/SoundDock en producción, backend/.data en dev."""
    if is_frozen():
        appdata = os.environ.get("APPDATA")
        if appdata:
            target = Path(appdata) / "SoundDock"
        else:
            target = Path.home() / ".sounddock"
    else:
        target = base_dir() / "backend" / ".data"
    target.mkdir(parents=True, exist_ok=True)
    return target


def db_path() -> Path:
    return data_dir() / "sounddock.db"


def default_music_dir() -> Path:
    """Carpeta de descarga por defecto: Música/SoundDock del usuario."""
    music_home = Path(os.environ.get("USERPROFILE", str(Path.home()))) / "Music" / "SoundDock"
    music_home.mkdir(parents=True, exist_ok=True)
    return music_home
