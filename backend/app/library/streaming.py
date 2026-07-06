import os
from pathlib import Path

CHUNK_SIZE = 64 * 1024


def _iter_file(path: Path, start: int, length: int):
    with open(path, "rb") as f:
        f.seek(start)
        remaining = length
        while remaining > 0:
            chunk = f.read(min(CHUNK_SIZE, remaining))
            if not chunk:
                break
            remaining -= len(chunk)
            yield chunk


def build_stream_response(path: Path, range_header: str | None):
    file_size = os.path.getsize(path)

    if not range_header or not range_header.startswith("bytes="):
        headers = {"Accept-Ranges": "bytes", "Content-Length": str(file_size)}
        return 200, headers, _iter_file(path, 0, file_size)

    range_spec = range_header.removeprefix("bytes=")
    start_str, _, end_str = range_spec.partition("-")
    start = int(start_str) if start_str else 0
    end = int(end_str) if end_str else file_size - 1
    end = min(end, file_size - 1)
    length = max(end - start + 1, 0)

    headers = {
        "Accept-Ranges": "bytes",
        "Content-Range": f"bytes {start}-{end}/{file_size}",
        "Content-Length": str(length),
    }
    return 206, headers, _iter_file(path, start, length)
