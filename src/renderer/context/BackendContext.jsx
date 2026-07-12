import React, { createContext, useContext, useEffect, useState } from "react";

const BackendContext = createContext(null);

export function BackendProvider({ children }) {
  const [status, setStatus] = useState("starting");
  const [config, setConfig] = useState(null);

  useEffect(() => {
    let unsubscribe = () => {};

    async function init() {
      const initialConfig = await window.sounddock.getBackendConfig();
      setConfig(initialConfig);
      setStatus(initialConfig.ready ? "ready" : "starting");

      unsubscribe = window.sounddock.onBackendStatusChange(async (nextStatus) => {
        setStatus(nextStatus);
        if (nextStatus === "ready") {
          setConfig(await window.sounddock.getBackendConfig());
        }
      });
    }

    init();
    return () => unsubscribe();
  }, []);

  return <BackendContext.Provider value={{ status, config }}>{children}</BackendContext.Provider>;
}

export function useBackend() {
  const ctx = useContext(BackendContext);
  if (!ctx) {
    throw new Error("useBackend debe usarse dentro de BackendProvider");
  }
  return ctx;
}
