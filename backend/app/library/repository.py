import sqlite3

CANCION_COLUMNS = [
    "id",
    "titulo",
    "artista",
    "genero",
    "album",
    "ruta_archivo",
    "portada_ruta",
    "duracion_segundos",
    "plataforma_origen",
    "url_origen",
    "calidad_kbps",
    "fecha_descarga",
    "fecha_modificacion",
    "revisado",
    "activo",
]

_SELECT_WITH_FAVORITO = """
    SELECT c.*, (f.id_cancion IS NOT NULL) AS es_favorito
    FROM canciones c
    LEFT JOIN favoritos f ON f.id_cancion = c.id
"""


def row_to_cancion(row: sqlite3.Row) -> dict:
    cancion = {key: row[key] for key in CANCION_COLUMNS}
    cancion["revisado"] = bool(cancion["revisado"])
    cancion["activo"] = bool(cancion["activo"])
    cancion["es_favorito"] = bool(row["es_favorito"])
    return cancion


def get_cancion(conn: sqlite3.Connection, cancion_id: int) -> dict | None:
    row = conn.execute(f"{_SELECT_WITH_FAVORITO} WHERE c.id = ?", (cancion_id,)).fetchone()
    return row_to_cancion(row) if row else None


def insert_cancion(
    conn: sqlite3.Connection,
    *,
    titulo: str,
    artista: str | None,
    ruta_archivo: str,
    duracion_segundos: int | None,
    plataforma_origen: str,
    url_origen: str | None,
    calidad_kbps: int | None,
    revisado: bool,
    genero: str | None = None,
    album: str | None = None,
) -> int:
    cursor = conn.execute(
        """
        INSERT INTO canciones (
            titulo, artista, genero, album, ruta_archivo, duracion_segundos,
            plataforma_origen, url_origen, calidad_kbps, revisado
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            titulo,
            artista,
            genero,
            album,
            ruta_archivo,
            duracion_segundos,
            plataforma_origen,
            url_origen,
            calidad_kbps,
            int(revisado),
        ),
    )
    conn.commit()
    return cursor.lastrowid


def update_cancion(conn: sqlite3.Connection, cancion_id: int, **fields) -> None:
    if not fields:
        return
    assignments = [f"{key} = ?" for key in fields]
    values = list(fields.values())
    assignments.append("revisado = 1")
    assignments.append("fecha_modificacion = datetime('now')")
    values.append(cancion_id)
    conn.execute(f"UPDATE canciones SET {', '.join(assignments)} WHERE id = ?", values)
    conn.commit()
