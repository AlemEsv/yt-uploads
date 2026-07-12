import React from "react";

const BLOBS = [
  { className: "glow-blob glow-blob--sky", style: { top: "-12%", left: "-10%" } },
  { className: "glow-blob glow-blob--blue", style: { top: "40%", right: "-14%" } },
  { className: "glow-blob glow-blob--violet", style: { bottom: "-16%", left: "18%" } },
  { className: "glow-blob glow-blob--indigo", style: { top: "-8%", right: "22%" } },
];

export default function BackgroundGlows() {
  return (
    <div className="glow-field">
      {BLOBS.map((blob, i) => (
        <div key={i} className={blob.className} style={blob.style} />
      ))}
    </div>
  );
}
