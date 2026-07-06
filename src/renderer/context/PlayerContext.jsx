import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useLibrary } from "./LibraryContext.jsx";
import { useApi } from "../hooks/useApi.js";

const PlayerContext = createContext(null);

const HISTORY_MIN_SECONDS = 30;
const HISTORY_MIN_RATIO = 0.5;
const VOLUME_STORAGE_KEY = "sounddock:volume";

export function PlayerProvider({ children }) {
  const { songs } = useLibrary();
  const api = useApi();

  const audioRef = useRef(null);
  if (audioRef.current === null) {
    audioRef.current = new Audio();
  }

  const accumulatedRef = useRef(0);
  const lastTimeRef = useRef(0);
  const loggedRef = useRef(false);
  const currentSongRef = useRef(null);
  const queueRef = useRef([]);
  const queueIndexRef = useRef(-1);

  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolumeState] = useState(() => {
    const stored = Number(localStorage.getItem(VOLUME_STORAGE_KEY));
    return Number.isFinite(stored) && stored > 0 ? stored : 0.8;
  });
  const [isShuffle, setIsShuffle] = useState(false);
  const [loopMode, setLoopMode] = useState("off"); // off | one | all

  const currentSongId = queueIndex >= 0 ? queue[queueIndex] : null;
  const currentSong = songs.find((s) => s.id === currentSongId) ?? null;

  useEffect(() => {
    currentSongRef.current = currentSong;
  }, [currentSong]);
  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);
  useEffect(() => {
    queueIndexRef.current = queueIndex;
  }, [queueIndex]);

  // Mantiene queueIndex dentro de rango cuando la cola cambia de tamaño.
  useEffect(() => {
    if (queueIndex >= queue.length) {
      setQueueIndex(queue.length - 1);
    }
  }, [queue, queueIndex]);

  const next = useCallback(() => {
    const q = queueRef.current;
    const idx = queueIndexRef.current;
    if (q.length === 0) return;

    if (loopMode === "one") {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
      return;
    }
    if (isShuffle && q.length > 1) {
      let candidate = idx;
      while (candidate === idx) {
        candidate = Math.floor(Math.random() * q.length);
      }
      setQueueIndex(candidate);
      setIsPlaying(true);
      return;
    }
    if (idx < q.length - 1) {
      setQueueIndex(idx + 1);
      setIsPlaying(true);
    } else if (loopMode === "all") {
      setQueueIndex(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  }, [loopMode, isShuffle]);

  const previous = useCallback(() => {
    const audio = audioRef.current;
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      setCurrentTime(0);
      return;
    }
    const idx = queueIndexRef.current;
    if (idx > 0) {
      setQueueIndex(idx - 1);
      setIsPlaying(true);
    } else {
      audio.currentTime = 0;
      setCurrentTime(0);
    }
  }, []);

  const handleEnded = useCallback(() => next(), [next]);

  const handleTimeUpdate = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const now = audio.currentTime;
    const delta = now - lastTimeRef.current;
    if (delta > 0 && delta < 2) {
      accumulatedRef.current += delta;
    }
    lastTimeRef.current = now;
    setCurrentTime(now);

    const song = currentSongRef.current;
    if (song && !loggedRef.current && api) {
      const duration = song.duracion_segundos;
      const threshold = duration ? Math.min(HISTORY_MIN_SECONDS, duration * HISTORY_MIN_RATIO) : HISTORY_MIN_SECONDS;
      if (accumulatedRef.current >= threshold) {
        loggedRef.current = true;
        api.registerHistory(song.id).catch(() => {});
      }
    }
  }, [api]);

  useEffect(() => {
    const audio = audioRef.current;
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [handleTimeUpdate, handleEnded]);

  // Cambio de pista: reinicia contadores de historial y carga la nueva fuente.
  useEffect(() => {
    accumulatedRef.current = 0;
    lastTimeRef.current = 0;
    loggedRef.current = false;

    const audio = audioRef.current;
    if (!currentSong || !api) {
      audio.pause();
      audio.removeAttribute("src");
      return;
    }
    // El audio se sirve por HTTP (igual que las portadas) en vez de file://: Electron
    // bloquea la carga de file:// desde el origen http://localhost:5173 en desarrollo.
    audio.src = api.streamUrl(currentSong.id);
    audio.volume = volume;
    audio.play().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSong?.id, api]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!currentSong) return;
    if (isPlaying) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [isPlaying, currentSong]);

  useEffect(() => {
    audioRef.current.volume = volume;
    localStorage.setItem(VOLUME_STORAGE_KEY, String(volume));
  }, [volume]);

  function playNow(songId) {
    const index = queue.indexOf(songId);
    if (index !== -1) {
      setQueueIndex(index);
    } else {
      const insertAt = queueIndex >= 0 ? queueIndex + 1 : queue.length;
      setQueue([...queue.slice(0, insertAt), songId, ...queue.slice(insertAt)]);
      setQueueIndex(insertAt);
    }
    setIsPlaying(true);
  }

  function enqueue(songId) {
    setQueue((current) => (current.includes(songId) ? current : [...current, songId]));
  }

  function removeFromQueue(index) {
    setQueue((current) => current.filter((_, i) => i !== index));
  }

  function reorderQueue(fromIndex, toIndex) {
    setQueue((current) => {
      const next2 = [...current];
      const [moved] = next2.splice(fromIndex, 1);
      next2.splice(toIndex, 0, moved);
      return next2;
    });
    setQueueIndex((current) => {
      if (current === fromIndex) return toIndex;
      if (fromIndex < current && toIndex >= current) return current - 1;
      if (fromIndex > current && toIndex <= current) return current + 1;
      return current;
    });
  }

  function playQueueItem(index) {
    setQueueIndex(index);
    setIsPlaying(true);
  }

  function clearQueue() {
    setQueue([]);
    setQueueIndex(-1);
    setIsPlaying(false);
  }

  function togglePlay() {
    setIsPlaying((p) => !p);
  }

  function seek(time) {
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  }

  function setVolume(v) {
    setVolumeState(Math.min(1, Math.max(0, v)));
  }

  function toggleShuffle() {
    setIsShuffle((s) => !s);
  }

  function cycleLoopMode() {
    setLoopMode((mode) => (mode === "off" ? "all" : mode === "all" ? "one" : "off"));
  }

  const value = {
    currentSong,
    queue: queue.map((id) => songs.find((s) => s.id === id)).filter(Boolean),
    queueIndex,
    isPlaying,
    currentTime,
    duration: currentSong?.duracion_segundos ?? 0,
    volume,
    isShuffle,
    loopMode,
    playNow,
    enqueue,
    removeFromQueue,
    reorderQueue,
    playQueueItem,
    clearQueue,
    togglePlay,
    next,
    previous,
    seek,
    setVolume,
    toggleShuffle,
    cycleLoopMode,
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) {
    throw new Error("usePlayer debe usarse dentro de PlayerProvider");
  }
  return ctx;
}
