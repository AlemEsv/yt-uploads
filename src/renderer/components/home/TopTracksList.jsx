import React, { useMemo } from "react";
import { useLibrary } from "../../context/LibraryContext.jsx";
import EmptyState from "../common/EmptyState.jsx";
import RankedTrackRow from "./RankedTrackRow.jsx";

export default function TopTracksList({ topCanciones, onEdit }) {
  const { songs } = useLibrary();

  const rows = useMemo(
    () =>
      topCanciones
        .map((tc) => songs.find((s) => s.id === tc.song_id))
        .filter(Boolean)
        .slice(0, 10),
    [topCanciones, songs],
  );

  return (
    <div
      style={{
        background: "var(--color-sidebar-bg)",
        borderRadius: "15px",
        padding: "1.25rem",
      }}
    >
      <h3 style={{ margin: "0 0 0.5rem", fontWeight: 700, fontSize: "1.15rem" }}>Más escuchadas</h3>
      {rows.length === 0 ? (
        <EmptyState
          title="Todavía sin datos"
          description="Reproduce canciones para ver aquí tus más escuchadas."
        />
      ) : (
        <div>
          {rows.map((song, index) => (
            <RankedTrackRow key={song.id} rank={index + 1} song={song} onEdit={onEdit} />
          ))}
        </div>
      )}
    </div>
  );
}
