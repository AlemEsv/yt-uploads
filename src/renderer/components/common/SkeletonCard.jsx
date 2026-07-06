import React from "react";

export default function SkeletonCard() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
      <div
        style={{
          aspectRatio: "1 / 1",
          borderRadius: "10px",
          background: "linear-gradient(90deg, #161616 25%, #1f1f1f 37%, #161616 63%)",
          backgroundSize: "400% 100%",
          animation: "sounddock-shimmer 1.4s ease infinite",
        }}
      />
      <div style={{ height: "10px", width: "70%", borderRadius: "4px", background: "#1a1a1a" }} />
      <div style={{ height: "8px", width: "45%", borderRadius: "4px", background: "#161616" }} />
      <style>{`
        @keyframes sounddock-shimmer {
          0% { background-position: 100% 50%; }
          100% { background-position: 0 50%; }
        }
      `}</style>
    </div>
  );
}
