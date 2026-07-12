import React from "react";
import { BackendProvider } from "./context/BackendContext.jsx";
import MiniPlayer from "./MiniPlayer.jsx";

export default function MiniPlayerApp() {
  return (
    <BackendProvider>
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
        }}
      >
        <MiniPlayer />
      </div>
    </BackendProvider>
  );
}
