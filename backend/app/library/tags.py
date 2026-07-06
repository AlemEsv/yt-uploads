from pathlib import Path

from mutagen.easyid3 import EasyID3
from mutagen.id3 import ID3NoHeaderError
from mutagen.mp3 import MP3


def file_hash(path: Path) -> str:
    stat = path.stat()
    return f"{stat.st_size}:{int(stat.st_mtime)}"


def read_tags(path: Path) -> dict:
    titulo = artista = album = None
    duracion = None

    try:
        audio = MP3(str(path), ID3=EasyID3)
        titulo = (audio.get("title") or [None])[0]
        artista = (audio.get("artist") or [None])[0]
        album = (audio.get("album") or [None])[0]
        duracion = int(audio.info.length) if audio.info else None
    except ID3NoHeaderError:
        try:
            audio = MP3(str(path))
            duracion = int(audio.info.length) if audio.info else None
        except Exception:
            pass

    return {
        "titulo": titulo or path.stem,
        "artista": artista,
        "album": album,
        "duracion_segundos": duracion,
    }
