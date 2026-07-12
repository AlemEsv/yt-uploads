import sqlite3
import threading
from pathlib import Path

from app.paths import db_path

MIGRATIONS_DIR = Path(__file__).resolve().parent / "schema" / "migrations"

# La conexión se comparte entre el loop de asyncio y el worker thread de descargas;
# este lock serializa el acceso para evitar carreras sobre el mismo objeto Connection.
DB_LOCK = threading.Lock()


def _connect_raw(path: Path) -> sqlite3.Connection:
    # check_same_thread=False: el worker de descargas (thread aparte) y el loop
    # de asyncio comparten esta misma conexión. WAL permite que ambos lean/escriban
    # sin bloquearse mutuamente en el caso común.
    conn = sqlite3.connect(path, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    conn.execute("PRAGMA journal_mode = WAL")
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
    conn = _connect_raw(db_path())
    run_migrations(conn)
    return conn
