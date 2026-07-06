import { useMemo } from "react";
import { useBackend } from "../context/BackendContext.jsx";
import { createApiClient } from "../services/api.js";

export function useApi() {
  const { config } = useBackend();
  return useMemo(
    () => (config?.httpBaseUrl ? createApiClient(config.httpBaseUrl) : null),
    [config?.httpBaseUrl],
  );
}
