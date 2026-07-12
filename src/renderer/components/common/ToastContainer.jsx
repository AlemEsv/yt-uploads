import React from "react";
import { useToast } from "../../context/ToastContext.jsx";
import Toast from "./Toast.jsx";

export default function ToastContainer() {
  const { toasts, dismiss } = useToast();

  return (
    <div
      style={{
        position: "fixed",
        bottom: "1rem",
        right: "1rem",
        display: "flex",
        flexDirection: "column-reverse",
        gap: "0.5rem",
        zIndex: 1000,
      }}
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={dismiss} />
      ))}
    </div>
  );
}
