import sqlite3
from pathlib import Path

from app.paths import default_music_dir


def get_value(conn: sqlite3.Connection, clave: str, default: str | None = None) -> str | None:
    row = conn.execute("SELECT valor FROM configuracion WHERE clave = ?", (clave,)).fetchone()
    return row["valor"] if row else default


def get_download_dir(conn: sqlite3.Connection) -> Path:
    value = get_value(conn, "directorio_descarga")
    return Path(value) if value else default_music_dir()


def set_value(conn: sqlite3.Connection, clave: str, valor: str) -> None:
    conn.execute(
        "INSERT INTO configuracion (clave, valor) VALUES (?, ?) "
        "ON CONFLICT(clave) DO UPDATE SET valor = excluded.valor",
        (clave, valor),
    )
    conn.commit()
