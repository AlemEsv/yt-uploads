import sqlite3
from pathlib import Path

from app.paths import data_dir

EXPECTED_TABLES = {
    "canciones",
    "historial_reproduccion",
    "favoritos",
    "perfiles_tematicos",
    "configuracion",
}


def export_database(conn: sqlite3.Connection, destino: Path) -> int:
    destino.parent.mkdir(parents=True, exist_ok=True)
    destino_conn = sqlite3.connect(destino)
    try:
        conn.backup(destino_conn)
    finally:
        destino_conn.close()
    return destino.stat().st_size


def validate_backup_file(origen: Path) -> None:
    if not origen.exists():
        raise ValueError("El archivo de respaldo no existe")

    try:
        origen_conn = sqlite3.connect(origen)
        try:
            tablas = {
                row[0]
                for row in origen_conn.execute(
                    "SELECT name FROM sqlite_master WHERE type='table'"
                )
            }
        finally:
            origen_conn.close()
    except sqlite3.DatabaseError as exc:
        raise ValueError("El archivo no es una base de datos SQLite válida") from exc

    if not EXPECTED_TABLES.issubset(tablas):
        raise ValueError("El archivo no tiene el esquema esperado de SoundDock")


def safety_backup_path() -> Path:
    return data_dir() / "sounddock.pre-restore.bak"
