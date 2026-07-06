import React from "react";
import SongCard from "./SongCard.jsx";

export default function SongGrid({ songs, onEdit }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
        gap: "1rem",
        padding: "1rem 1.5rem",
      }}
    >
      {songs.map((song) => (
        <SongCard key={song.id} song={song} onEdit={onEdit} />
      ))}
    </div>
  );
}
