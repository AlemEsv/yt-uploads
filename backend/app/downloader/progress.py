"""Traduce los progress_hooks de yt-dlp a un payload compacto para WebSocket."""


def parse_progress(d: dict) -> dict | None:
    status = d.get("status")

    if status == "downloading":
        total = d.get("total_bytes") or d.get("total_bytes_estimate")
        downloaded = d.get("downloaded_bytes", 0)
        progress = int(downloaded / total * 100) if total else 0
        return {"status": "downloading", "progress": min(progress, 100), "eta_segundos": d.get("eta")}

    if status == "finished":
        return {"status": "converting", "progress": 100}

    return None
