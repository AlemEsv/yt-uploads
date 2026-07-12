import sqlite3

from app.library.repository import row_to_cancion


def list_playlists(conn: sqlite3.Connection) -> list[dict]:
    rows = conn.execute(
        """
        SELECT p.id, p.nombre, p.fecha_creacion,
               COUNT(pc.id_cancion) AS canciones,
               MIN(CASE WHEN pc.posicion = (
                   SELECT MIN(posicion) FROM playlist_canciones WHERE id_playlist = p.id
               ) THEN pc.id_cancion END) AS primera_cancion_id
        FROM playlists p
        LEFT JOIN playlist_canciones pc ON pc.id_playlist = p.id
        GROUP BY p.id
        ORDER BY p.fecha_creacion ASC
        """
    ).fetchall()
    return [dict(row) for row in rows]


def get_playlist(conn: sqlite3.Connection, playlist_id: int) -> dict | None:
    row = conn.execute("SELECT * FROM playlists WHERE id = ?", (playlist_id,)).fetchone()
    if not row:
        return None
    songs = conn.execute(
        """
        SELECT c.*, (f.id_cancion IS NOT NULL) AS es_favorito, pc.fecha_agregado
        FROM playlist_canciones pc
        JOIN canciones c ON c.id = pc.id_cancion
        LEFT JOIN favoritos f ON f.id_cancion = c.id
        WHERE pc.id_playlist = ?
        ORDER BY pc.posicion ASC
        """,
        (playlist_id,),
    ).fetchall()
    canciones = []
    for song_row in songs:
        cancion = row_to_cancion(song_row)
        cancion["fecha_agregado"] = song_row["fecha_agregado"]
        canciones.append(cancion)
    return {**dict(row), "canciones": canciones}


def create_playlist(conn: sqlite3.Connection, nombre: str) -> int:
    cursor = conn.execute("INSERT INTO playlists (nombre) VALUES (?)", (nombre,))
    conn.commit()
    return cursor.lastrowid


def rename_playlist(conn: sqlite3.Connection, playlist_id: int, nombre: str) -> bool:
    cursor = conn.execute("UPDATE playlists SET nombre = ? WHERE id = ?", (nombre, playlist_id))
    conn.commit()
    return cursor.rowcount > 0


def delete_playlist(conn: sqlite3.Connection, playlist_id: int) -> bool:
    cursor = conn.execute("DELETE FROM playlists WHERE id = ?", (playlist_id,))
    conn.commit()
    return cursor.rowcount > 0


def add_song(conn: sqlite3.Connection, playlist_id: int, song_id: int) -> None:
    next_pos = conn.execute(
        "SELECT COALESCE(MAX(posicion), 0) + 1 FROM playlist_canciones WHERE id_playlist = ?",
        (playlist_id,),
    ).fetchone()[0]
    conn.execute(
        "INSERT OR IGNORE INTO playlist_canciones (id_playlist, id_cancion, posicion) VALUES (?, ?, ?)",
        (playlist_id, song_id, next_pos),
    )
    conn.commit()


def remove_song(conn: sqlite3.Connection, playlist_id: int, song_id: int) -> bool:
    cursor = conn.execute(
        "DELETE FROM playlist_canciones WHERE id_playlist = ? AND id_cancion = ?",
        (playlist_id, song_id),
    )
    conn.commit()
    return cursor.rowcount > 0
