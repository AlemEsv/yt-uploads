import React from "react";
import RecentlyPlayedCard from "./RecentlyPlayedCard.jsx";

export default function RecentlyPlayedRow({ songs }) {
  if (songs.length === 0) return null;

  return (
    <div>
      <h3 style={{ margin: "0 0 0.75rem", fontWeight: 600, fontSize: "1.4rem" }}>
        Recently played
      </h3>
      <div style={{ display: "flex", gap: "1.25rem", overflowX: "auto", paddingBottom: "0.5rem" }}>
        {songs.map((song) => (
          <RecentlyPlayedCard key={song.id} song={song} />
        ))}
      </div>
    </div>
  );
}
