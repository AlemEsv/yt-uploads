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
    "hash_archivo",
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


_ORDER_BY = {
    "fecha_desc": "c.fecha_descarga DESC",
    "fecha_asc": "c.fecha_descarga ASC",
    "titulo_asc": "c.titulo COLLATE NOCASE ASC",
    "artista_asc": "c.artista COLLATE NOCASE ASC",
}


def get_cancion(conn: sqlite3.Connection, cancion_id: int) -> dict | None:
    row = conn.execute(f"{_SELECT_WITH_FAVORITO} WHERE c.id = ?", (cancion_id,)).fetchone()
    return row_to_cancion(row) if row else None


def find_by_ruta(conn: sqlite3.Connection, ruta_archivo: str) -> dict | None:
    row = conn.execute(f"{_SELECT_WITH_FAVORITO} WHERE c.ruta_archivo = ?", (ruta_archivo,)).fetchone()
    return row_to_cancion(row) if row else None


def _build_filters(*, q, artista, genero, plataforma, favoritos, activo):
    clauses = []
    params = []

    if activo is not None:
        clauses.append("c.activo = ?")
        params.append(int(activo))
    if q:
        clauses.append("(c.titulo LIKE ? OR c.artista LIKE ? OR c.album LIKE ?)")
        like = f"%{q}%"
        params.extend([like, like, like])
    if artista:
        clauses.append("c.artista LIKE ?")
        params.append(f"%{artista}%")
    if genero:
        clauses.append("c.genero LIKE ?")
        params.append(f"%{genero}%")
    if plataforma:
        clauses.append("c.plataforma_origen = ?")
        params.append(plataforma)
    if favoritos:
        clauses.append("f.id_cancion IS NOT NULL")

    where = f"WHERE {' AND '.join(clauses)}" if clauses else ""
    return where, params


def list_canciones(
    conn: sqlite3.Connection,
    *,
    q: str | None = None,
    artista: str | None = None,
    genero: str | None = None,
    plataforma: str | None = None,
    favoritos: bool = False,
    activo: bool | None = True,
    limit: int = 50,
    offset: int = 0,
    orden: str = "fecha_desc",
) -> list[dict]:
    where, params = _build_filters(
        q=q, artista=artista, genero=genero, plataforma=plataforma, favoritos=favoritos, activo=activo
    )
    order_clause = _ORDER_BY.get(orden, _ORDER_BY["fecha_desc"])
    rows = conn.execute(
        f"{_SELECT_WITH_FAVORITO} {where} ORDER BY {order_clause} LIMIT ? OFFSET ?",
        (*params, limit, offset),
    ).fetchall()
    return [row_to_cancion(row) for row in rows]


def count_canciones(
    conn: sqlite3.Connection,
    *,
    q: str | None = None,
    artista: str | None = None,
    genero: str | None = None,
    plataforma: str | None = None,
    favoritos: bool = False,
    activo: bool | None = True,
) -> int:
    where, params = _build_filters(
        q=q, artista=artista, genero=genero, plataforma=plataforma, favoritos=favoritos, activo=activo
    )
    row = conn.execute(
        f"SELECT COUNT(*) AS total FROM canciones c LEFT JOIN favoritos f ON f.id_cancion = c.id {where}",
        params,
    ).fetchone()
    return row["total"]


def list_favoritos(conn: sqlite3.Connection, limit: int = 50, offset: int = 0) -> list[dict]:
    rows = conn.execute(
        f"""
        {_SELECT_WITH_FAVORITO}
        WHERE f.id_cancion IS NOT NULL AND c.activo = 1
        ORDER BY f.fecha_marcado DESC
        LIMIT ? OFFSET ?
        """,
        (limit, offset),
    ).fetchall()
    return [row_to_cancion(row) for row in rows]


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
    hash_archivo: str | None = None,
) -> int:
    cursor = conn.execute(
        """
        INSERT INTO canciones (
            titulo, artista, genero, album, ruta_archivo, duracion_segundos,
            plataforma_origen, url_origen, calidad_kbps, revisado, hash_archivo
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
            hash_archivo,
        ),
    )
    conn.commit()
    return cursor.lastrowid


# Edición asistida por el usuario: siempre marca la canción como revisada.
def update_cancion(conn: sqlite3.Connection, cancion_id: int, **fields) -> None:
    if not fields:
        return
    set_fields(conn, cancion_id, **fields, revisado=1)


# Actualización interna (import/scan/favoritos) sin forzar `revisado`.
def set_fields(conn: sqlite3.Connection, cancion_id: int, **fields) -> None:
    if not fields:
        return
    assignments = [f"{key} = ?" for key in fields]
    values = list(fields.values())
    assignments.append("fecha_modificacion = datetime('now')")
    values.append(cancion_id)
    conn.execute(f"UPDATE canciones SET {', '.join(assignments)} WHERE id = ?", values)
    conn.commit()


def mark_inactive(conn: sqlite3.Connection, cancion_id: int) -> None:
    set_fields(conn, cancion_id, activo=0)


# favoritos/historial se limpian solos por ON DELETE CASCADE al borrar esta fila.
def delete_cancion(conn: sqlite3.Connection, cancion_id: int) -> str | None:
    row = conn.execute("SELECT ruta_archivo FROM canciones WHERE id = ?", (cancion_id,)).fetchone()
    if not row:
        return None
    conn.execute("DELETE FROM canciones WHERE id = ?", (cancion_id,))
    conn.commit()
    return row["ruta_archivo"]


def set_favorito(conn: sqlite3.Connection, cancion_id: int) -> None:
    conn.execute(
        "INSERT OR IGNORE INTO favoritos (id_cancion) VALUES (?)",
        (cancion_id,),
    )
    conn.commit()


def unset_favorito(conn: sqlite3.Connection, cancion_id: int) -> None:
    conn.execute("DELETE FROM favoritos WHERE id_cancion = ?", (cancion_id,))
    conn.commit()


def list_active_paths(conn: sqlite3.Connection) -> list[dict]:
    rows = conn.execute("SELECT id, ruta_archivo FROM canciones WHERE activo = 1").fetchall()
    return [{"id": row["id"], "ruta_archivo": row["ruta_archivo"]} for row in rows]
