"""Acceso a la tabla `configuracion` (clave/valor genérico)."""

import sqlite3


def get_value(conn: sqlite3.Connection, clave: str, default: str | None = None) -> str | None:
    row = conn.execute("SELECT valor FROM configuracion WHERE clave = ?", (clave,)).fetchone()
    return row["valor"] if row else default


def set_value(conn: sqlite3.Connection, clave: str, valor: str) -> None:
    conn.execute(
        "INSERT INTO configuracion (clave, valor) VALUES (?, ?) "
        "ON CONFLICT(clave) DO UPDATE SET valor = excluded.valor",
        (clave, valor),
    )
    conn.commit()
