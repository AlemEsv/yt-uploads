import React, { useState } from "react";
import { useDownloads } from "../../hooks/useDownloads.js";
import { useLibrary } from "../../context/LibraryContext.jsx";
import MetadataEditModal from "../metadata/MetadataEditModal.jsx";

const STATUS_LABEL = {
  queued: "Queued",
  downloading: "Downloading",
  converting: "Converting",
  completed: "Done",
  error: "Error",
};

export default function CapturePanel() {
  const { applyUpdate } = useLibrary();
  const [pendingReview, setPendingReview] = useState(null);
  const { items } = useDownloads({ onNeedsReview: setPendingReview });

  const recentItems = Object.values(items)
    .filter((item) => item.status !== "completed")
    .slice(-5)
    .reverse();

  if (recentItems.length === 0 && !pendingReview) {
    return null;
  }

  return (
    <div className="popover-in absolute top-[58px] right-4 w-[340px] p-3 rounded-[12px] border border-white/10 glass shadow-2xl z-[1500]">
      {recentItems.length > 0 && (
        <ul className="list-none m-0 p-0 flex flex-col gap-2">
          {recentItems.map((item) => (
            <li key={item.songId} className="text-[12px] text-[#9b9b9b] flex justify-between gap-2">
              <span className="truncate">{item.cancion?.titulo ?? item.url}</span>
              <span className="shrink-0">
                {STATUS_LABEL[item.status] ?? item.status}
                {item.status === "downloading" ? ` ${item.progress ?? 0}%` : ""}
              </span>
            </li>
          ))}
        </ul>
      )}

      {pendingReview && (
        <MetadataEditModal
          cancion={pendingReview}
          onSaved={applyUpdate}
          onClose={() => setPendingReview(null)}
        />
      )}
    </div>
  );
}
