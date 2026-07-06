import { useCallback, useRef, useState } from "react";
import { useWebSocketEvent } from "../context/WebSocketContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { resolveErrorKind } from "../utils/errorKindMap.js";

export function useDownloads({ onNeedsReview } = {}) {
  const [items, setItems] = useState({});
  const { showSuccess, showError } = useToast();
  const onNeedsReviewRef = useRef(onNeedsReview);
  onNeedsReviewRef.current = onNeedsReview;

  const upsert = useCallback((songId, patch) => {
    setItems((current) => ({ ...current, [songId]: { ...current[songId], ...patch } }));
  }, []);

  useWebSocketEvent(
    "download_queued",
    useCallback(
      (data) => upsert(data.song_id, { songId: data.song_id, url: data.url, status: "queued", progress: 0 }),
      [upsert],
    ),
  );

  useWebSocketEvent(
    "download_started",
    useCallback((data) => upsert(data.song_id, { status: "downloading", progress: 0 }), [upsert]),
  );

  useWebSocketEvent(
    "download_progress",
    useCallback((data) => upsert(data.song_id, { status: "downloading", progress: data.progress }), [upsert]),
  );

  useWebSocketEvent(
    "download_postprocessing",
    useCallback((data) => upsert(data.song_id, { status: "converting", progress: 100 }), [upsert]),
  );

  useWebSocketEvent(
    "download_completed",
    useCallback(
      (data) => {
        upsert(data.song_id, { status: "completed", progress: 100, cancion: data.cancion });
        showSuccess({ title: "Descarga completa", message: `${data.cancion.titulo} se agregó a tu biblioteca.` });
        if (data.needs_review && onNeedsReviewRef.current) {
          onNeedsReviewRef.current(data.cancion);
        }
      },
      [upsert, showSuccess],
    ),
  );

  useWebSocketEvent(
    "download_error",
    useCallback(
      (data) => {
        upsert(data.song_id, { status: "error", errorKind: data.kind });
        const resolved = resolveErrorKind(data.kind);
        showError({ title: resolved.title, message: data.message || resolved.message });
      },
      [upsert, showError],
    ),
  );

  return { items };
}
