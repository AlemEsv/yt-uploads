import sqlite3
from pathlib import Path

from app.paths import db_path

MIGRATIONS_DIR = Path(__file__).resolve().parent / "schema" / "migrations"


def _connect_raw(path: Path) -> sqlite3.Connection:
    conn = sqlite3.connect(path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def _migration_files() -> list[Path]:
    return sorted(MIGRATIONS_DIR.glob("*.sql"), key=lambda p: p.name)


def run_migrations(conn: sqlite3.Connection) -> None:
    current_version = conn.execute("PRAGMA user_version").fetchone()[0]
    migrations = _migration_files()

    for index, migration_file in enumerate(migrations, start=1):
        if index <= current_version:
            continue
        sql = migration_file.read_text(encoding="utf-8")
        conn.executescript(sql)
        conn.execute(f"PRAGMA user_version = {index}")
        conn.commit()


def get_connection() -> sqlite3.Connection:
    """base de datos activa de la app."""
    conn = _connect_raw(db_path())
    run_migrations(conn)
    return conn
