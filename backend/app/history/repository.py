import sqlite3


def insert_reproduccion(conn: sqlite3.Connection, cancion_id: int) -> dict:
    cursor = conn.execute("INSERT INTO historial_reproduccion (id_cancion) VALUES (?)", (cancion_id,))
    conn.commit()
    row = conn.execute(
        "SELECT id, id_cancion AS song_id, fecha_hora FROM historial_reproduccion WHERE id = ?",
        (cursor.lastrowid,),
    ).fetchone()
    return dict(row)


def list_historial(conn: sqlite3.Connection, limit: int = 50, offset: int = 0) -> list[dict]:
    rows = conn.execute(
        """
        SELECT h.id, h.id_cancion AS song_id, c.titulo, c.artista, h.fecha_hora
        FROM historial_reproduccion h
        JOIN canciones c ON c.id = h.id_cancion
        ORDER BY h.fecha_hora DESC
        LIMIT ? OFFSET ?
        """,
        (limit, offset),
    ).fetchall()
    return [dict(row) for row in rows]
