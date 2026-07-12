import React, { useEffect, useMemo, useState } from "react";
import { useApi } from "../hooks/useApi.js";
import { useLibrary } from "../context/LibraryContext.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import MetadataEditModal from "../components/metadata/MetadataEditModal.jsx";
import RankedTrackRow from "../components/home/RankedTrackRow.jsx";

function relativeTime(fechaHora) {
  const then = new Date(`${fechaHora.replace(" ", "T")}Z`);
  const diffMin = Math.floor((Date.now() - then.getTime()) / 60000);
  if (diffMin < 1) return "ahora";
  if (diffMin < 60) return `hace ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `hace ${diffH} h`;
  return `hace ${Math.floor(diffH / 24)} d`;
}

export default function RecentPage() {
  const api = useApi();
  const { songs, applyUpdate } = useLibrary();
  const [history, setHistory] = useState([]);
  const [editingSong, setEditingSong] = useState(null);

  useEffect(() => {
    if (!api) return;
    api.getHistory(50).then(({ items }) => setHistory(items));
  }, [api]);

  const rows = useMemo(
    () =>
      history
        .map((item) => {
          const song = songs.find((s) => s.id === item.song_id);
          return song ? { song, when: relativeTime(item.fecha_hora), key: item.id } : null;
        })
        .filter(Boolean),
    [history, songs],
  );

  return (
    <div>
      <div style={{ padding: "1rem 1.5rem 0" }}>
        <h2 style={{ margin: 0 }}>Reciente</h2>
      </div>
      {rows.length === 0 ? (
        <EmptyState
          title="Aún no has escuchado nada"
          description="Reproduce una canción para verla aquí."
        />
      ) : (
        <div style={{ padding: "1rem 1.5rem" }}>
          {rows.map(({ song, when, key }) => (
            <RankedTrackRow key={key} rank={when} song={song} onEdit={setEditingSong} />
          ))}
        </div>
      )}

      {editingSong && (
        <MetadataEditModal
          cancion={editingSong}
          onSaved={(updated) => {
            applyUpdate(updated);
            setEditingSong(updated);
          }}
          onClose={() => setEditingSong(null)}
        />
      )}
    </div>
  );
}
