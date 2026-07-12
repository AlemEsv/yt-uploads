import React from "react";
import TrackRow from "./TrackRow.jsx";

export default function TrackTable({ rows, columns = [], showRank = true, onEdit }) {
  return (
    <div className="glass rounded-[15px] overflow-hidden">
      <div className="flex items-center gap-4 px-5 py-2 border-b border-white/5 text-[11px] font-semibold text-[var(--color-muted-text)] tracking-wider">
        {showRank && <span className="w-5 text-center">#</span>}
        <span className="w-[44px]" />
        <span className="flex-1">TITLE</span>
        {columns.map((col) => (
          <span key={col.key} className={col.className}>
            {col.header}
          </span>
        ))}
        <span className="w-10 text-right">TIME</span>
        <span className="w-14" />
      </div>

      {rows.map((row, idx) => (
        <TrackRow
          key={row.key ?? row.song.id}
          rank={showRank ? idx + 1 : null}
          song={row.song}
          columns={columns.map((col) => ({
            ...col,
            render: (song) => col.render(song, row),
          }))}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}
