import argparse
import socket
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import uvicorn

from app.main import app

DEFAULT_HOST = "127.0.0.1"
DEFAULT_PORT = 8765


def _port_is_free(host: str, port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        try:
            sock.bind((host, port))
            return True
        except OSError:
            return False


def _pick_port(host: str, preferred_port: int) -> int:
    if _port_is_free(host, preferred_port):
        return preferred_port
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.bind((host, 0))
        return sock.getsockname()[1]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--host", default=DEFAULT_HOST)
    parser.add_argument("--port", type=int, default=DEFAULT_PORT)
    args = parser.parse_args()

    port = _pick_port(args.host, args.port)
    app.state.host = args.host
    app.state.port = port

    uvicorn.run(app, host=args.host, port=port, log_level="info")


if __name__ == "__main__":
    main()
