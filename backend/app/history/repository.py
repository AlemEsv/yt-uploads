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


def historial_ventana(conn: sqlite3.Connection, ventana_dias: int) -> list[sqlite3.Row]:
    return conn.execute(
        """
        SELECT h.id_cancion AS song_id, c.titulo, c.artista, c.genero, c.plataforma_origen
        FROM historial_reproduccion h
        JOIN canciones c ON c.id = h.id_cancion
        WHERE h.fecha_hora >= datetime('now', ?)
        """,
        (f"-{ventana_dias} days",),
    ).fetchall()


def get_stats(conn: sqlite3.Connection, ventana_dias: int = 7) -> dict:
    rows = historial_ventana(conn, ventana_dias)

    conteo_canciones = {}
    conteo_generos = {}
    conteo_plataformas = {}

    for row in rows:
        key = row["song_id"]
        if key not in conteo_canciones:
            conteo_canciones[key] = {
                "song_id": key,
                "titulo": row["titulo"],
                "artista": row["artista"],
                "reproducciones": 0,
            }
        conteo_canciones[key]["reproducciones"] += 1

        genero = row["genero"] or "Sin género"
        conteo_generos[genero] = conteo_generos.get(genero, 0) + 1

        plataforma = row["plataforma_origen"]
        conteo_plataformas[plataforma] = conteo_plataformas.get(plataforma, 0) + 1

    top_canciones = sorted(conteo_canciones.values(), key=lambda x: x["reproducciones"], reverse=True)[:10]
    top_generos = sorted(
        ({"genero": g, "reproducciones": n} for g, n in conteo_generos.items()),
        key=lambda x: x["reproducciones"],
        reverse=True,
    )
    top_plataformas = sorted(
        ({"plataforma": p, "reproducciones": n} for p, n in conteo_plataformas.items()),
        key=lambda x: x["reproducciones"],
        reverse=True,
    )

    return {
        "ventana_dias": ventana_dias,
        "top_canciones": top_canciones,
        "top_generos": top_generos,
        "top_plataformas": top_plataformas,
        "total_reproducciones": len(rows),
    }
