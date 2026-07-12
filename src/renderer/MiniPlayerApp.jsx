import React from "react";
import { BackendProvider, useBackend } from "./context/BackendContext.jsx";
import { WebSocketProvider } from "./context/WebSocketContext.jsx";
import { LibraryProvider } from "./context/LibraryContext.jsx";
import { PlayerProvider } from "./context/PlayerContext.jsx";
import { PlaylistsProvider } from "./context/PlaylistsContext.jsx";
import MiniPlayer from "./MiniPlayer.jsx";

function MiniShell() {
  const { status } = useBackend();
  if (status !== "ready") return null;
  return (
    <WebSocketProvider>
      <LibraryProvider>
        <PlaylistsProvider>
          <PlayerProvider>
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
          </PlayerProvider>
        </PlaylistsProvider>
      </LibraryProvider>
    </WebSocketProvider>
  );
}

export default function MiniPlayerApp() {
  return (
    <BackendProvider>
      <MiniShell />
    </BackendProvider>
  );
}
