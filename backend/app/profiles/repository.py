import json
import sqlite3


def row_to_perfil(row: sqlite3.Row) -> dict:
    return {
        "id": row["id"],
        "nombre": row["nombre"],
        "paleta_colores": json.loads(row["paleta_colores"]),
        "criterio_activacion": json.loads(row["criterio_activacion"]) if row["criterio_activacion"] else None,
        "es_predefinido": bool(row["es_predefinido"]),
        "fecha_creacion": row["fecha_creacion"],
    }


def list_perfiles(conn: sqlite3.Connection) -> list[dict]:
    rows = conn.execute("SELECT * FROM perfiles_tematicos ORDER BY es_predefinido DESC, nombre ASC").fetchall()
    return [row_to_perfil(row) for row in rows]


def get_perfil(conn: sqlite3.Connection, perfil_id: int) -> dict | None:
    row = conn.execute("SELECT * FROM perfiles_tematicos WHERE id = ?", (perfil_id,)).fetchone()
    return row_to_perfil(row) if row else None


def create_perfil(
    conn: sqlite3.Connection, *, nombre: str, paleta_colores: dict, criterio_activacion: dict | None
) -> int:
    cursor = conn.execute(
        "INSERT INTO perfiles_tematicos (nombre, paleta_colores, criterio_activacion, es_predefinido) VALUES (?, ?, ?, 0)",
        (nombre, json.dumps(paleta_colores), json.dumps(criterio_activacion) if criterio_activacion else None),
    )
    conn.commit()
    return cursor.lastrowid


def update_perfil(conn: sqlite3.Connection, perfil_id: int, **fields) -> None:
    if not fields:
        return
    if "paleta_colores" in fields:
        fields["paleta_colores"] = json.dumps(fields["paleta_colores"])
    if "criterio_activacion" in fields:
        fields["criterio_activacion"] = json.dumps(fields["criterio_activacion"]) if fields["criterio_activacion"] else None
    assignments = [f"{key} = ?" for key in fields]
    values = list(fields.values()) + [perfil_id]
    conn.execute(f"UPDATE perfiles_tematicos SET {', '.join(assignments)} WHERE id = ?", values)
    conn.commit()


def delete_perfil(conn: sqlite3.Connection, perfil_id: int) -> bool:
    row = conn.execute("SELECT es_predefinido FROM perfiles_tematicos WHERE id = ?", (perfil_id,)).fetchone()
    if not row:
        return False
    if row["es_predefinido"]:
        raise ValueError("No se puede eliminar un perfil predefinido")
    conn.execute("DELETE FROM perfiles_tematicos WHERE id = ?", (perfil_id,))
    conn.commit()
    return True
