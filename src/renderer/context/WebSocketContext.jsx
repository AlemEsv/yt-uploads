import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef } from "react";
import { useBackend } from "./BackendContext.jsx";

const WebSocketContext = createContext(null);

export function WebSocketProvider({ children }) {
  const { status, config } = useBackend();
  const listenersRef = useRef(new Map());

  useEffect(() => {
    if (status !== "ready" || !config?.wsUrl) return undefined;

    const socket = new WebSocket(config.wsUrl);

    socket.onmessage = (event) => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch {
        return;
      }
      const handlers = listenersRef.current.get(data.event);
      if (handlers) {
        handlers.forEach((handler) => handler(data));
      }
    };

    return () => socket.close();
  }, [status, config?.wsUrl]);

  const subscribe = useCallback((eventName, handler) => {
    if (!listenersRef.current.has(eventName)) {
      listenersRef.current.set(eventName, new Set());
    }
    listenersRef.current.get(eventName).add(handler);
    return () => {
      listenersRef.current.get(eventName)?.delete(handler);
    };
  }, []);

  const value = useMemo(() => ({ subscribe }), [subscribe]);

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
}

export function useWebSocketEvent(eventName, handler) {
  const ctx = useContext(WebSocketContext);
  if (!ctx) {
    throw new Error("useWebSocketEvent debe usarse dentro de WebSocketProvider");
  }
  useEffect(() => ctx.subscribe(eventName, handler), [eventName, handler, ctx]);
}
