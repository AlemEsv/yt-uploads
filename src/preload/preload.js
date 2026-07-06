const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("sounddock", {
  getBackendConfig: () => ipcRenderer.invoke("backend:get-config"),

  onBackendStatusChange: (callback) => {
    const wrapped = (_event, status) => callback(status);
    ipcRenderer.on("backend:status", wrapped);
    return () => ipcRenderer.removeListener("backend:status", wrapped);
  },
});
