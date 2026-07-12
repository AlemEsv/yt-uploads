import React, { useState, useEffect } from "react";
import { Music } from "lucide-react";
import { useApi } from "../../hooks/useApi.js";

export default function SongCover({
  song,
  className = "w-[45px] h-[45px] rounded-[6px]",
  iconSize = 20,
  onClick,
}) {
  const api = useApi();
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
  }, [song?.id, song?.fecha_modificacion]);

  const coverUrl = api && song?.id ? api.coverUrl(song.id, song.fecha_modificacion) : null;

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden shrink-0 bg-[var(--color-cover-placeholder-bg)] flex items-center justify-center border border-white/10 ${className}`}
    >
      <Music size={iconSize} className="text-white/30 shrink-0" />
      {coverUrl && !error && (
        <img
          key={`${song.id}-${song.fecha_modificacion ?? ""}`}
          src={coverUrl}
          alt=""
          onError={() => setError(true)}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
    </div>
  );
}
