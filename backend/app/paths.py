import os
import sys
from pathlib import Path


def is_frozen() -> bool:
    return getattr(sys, "frozen", False)


def base_dir() -> Path:
    if is_frozen():
        return Path(sys.executable).parent
    return Path(__file__).resolve().parents[2]


def ffmpeg_path() -> Path:
    return base_dir() / "ffmpeg" / "bin"


def data_dir() -> Path:
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
    music_home = Path(os.environ.get("USERPROFILE", str(Path.home()))) / "Music" / "SoundDock"
    music_home.mkdir(parents=True, exist_ok=True)
    return music_home
