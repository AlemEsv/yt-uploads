import { useEffect, useState } from "react";

export function useRemotePlayerState() {
  const [state, setState] = useState({ currentSong: null, isPlaying: false });

  useEffect(() => {
    window.sounddock?.getPlayerState().then((initial) => {
      if (initial) setState(initial);
    });
    return window.sounddock?.onPlayerStateChange(setState);
  }, []);

  function sendCommand(action) {
    window.sounddock?.sendPlayerCommand(action);
  }

  return {
    currentSong: state.currentSong,
    isPlaying: state.isPlaying,
    togglePlay: () => sendCommand("toggle"),
    next: () => sendCommand("next"),
    previous: () => sendCommand("previous"),
  };
}
