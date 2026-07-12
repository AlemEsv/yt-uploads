from pathlib import Path

from mutagen.id3 import APIC, ID3, ID3NoHeaderError, TIT2, TPE1

INCOMPLETE_MARKERS = {"", "unknown", "untitled", "video", "audio", "na"}


def _looks_incomplete(value: str | None) -> bool:
    if not value:
        return True
    return value.strip().lower() in INCOMPLETE_MARKERS


def _find_thumbnail(filepath: str) -> Path | None:
    base = Path(filepath).with_suffix("")
    for ext in (".jpg", ".jpeg", ".png"):
        candidate = base.with_suffix(ext)
        if candidate.exists():
            return candidate
    return None


def write_tags(filepath: str, info: dict) -> tuple[str, str | None, bool]:
    titulo = info.get("title") or Path(filepath).stem
    artista = info.get("artist") or info.get("uploader") or info.get("channel")

    try:
        tags = ID3(filepath)
    except ID3NoHeaderError:
        tags = ID3()

    tags.setall("TIT2", [TIT2(encoding=3, text=titulo)])
    if artista:
        tags.setall("TPE1", [TPE1(encoding=3, text=artista)])

    thumbnail_path = _find_thumbnail(filepath)
    if thumbnail_path:
        tags.setall(
            "APIC",
            [
                APIC(
                    encoding=3,
                    mime="image/png" if thumbnail_path.suffix.lower() == ".png" else "image/jpeg",
                    type=3,
                    desc="Cover",
                    data=thumbnail_path.read_bytes(),
                )
            ],
        )

    tags.save(filepath)

    if thumbnail_path:
        thumbnail_path.unlink(missing_ok=True)

    revisado = not (_looks_incomplete(titulo) or _looks_incomplete(artista))
    return titulo, artista, revisado


def replace_cover(filepath: str, image_path: str) -> None:
    try:
        tags = ID3(filepath)
    except ID3NoHeaderError:
        tags = ID3()

    image = Path(image_path)
    mime = "image/png" if image.suffix.lower() == ".png" else "image/jpeg"

    tags.delall("APIC")
    tags.setall(
        "APIC",
        [APIC(encoding=3, mime=mime, type=3, desc="Cover", data=image.read_bytes())],
    )
    tags.save(filepath)
