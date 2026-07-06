import React from "react";
import SongListRow from "./SongListRow.jsx";

export default function SongListView({ songs, onEdit }) {
  return (
    <div style={{ padding: "0.5rem 0" }}>
      {songs.map((song) => (
        <SongListRow key={song.id} song={song} onEdit={onEdit} />
      ))}
    </div>
  );
}
