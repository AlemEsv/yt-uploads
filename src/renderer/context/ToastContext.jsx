import React, { createContext, useCallback, useContext, useState } from "react";

const ToastContext = createContext(null);
let nextToastId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(
    (tone, { title, message }) => {
      const id = nextToastId++;
      setToasts((current) => [...current, { id, tone, title, message }]);
      setTimeout(() => dismiss(id), tone === "error" ? 8000 : 5000);
    },
    [dismiss],
  );

  const value = {
    toasts,
    dismiss,
    showSuccess: (payload) => show("success", payload),
    showError: (payload) => show("error", payload),
  };

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast debe usarse dentro de ToastProvider");
  }
  return ctx;
}
