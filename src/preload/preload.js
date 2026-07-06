const { contextBridge, ipcRenderer, webUtils } = require("electron");

contextBridge.exposeInMainWorld("sounddock", {
  getBackendConfig: () => ipcRenderer.invoke("backend:get-config"),

  onBackendStatusChange: (callback) => {
    const wrapped = (_event, status) => callback(status);
    ipcRenderer.on("backend:status", wrapped);
    return () => ipcRenderer.removeListener("backend:status", wrapped);
  },

  chooseMp3Files: () => ipcRenderer.invoke("dialog:choose-mp3-files"),
  showItemInFolder: (absolutePath) => ipcRenderer.invoke("shell:show-in-folder", absolutePath),

  // Sincrónico: webUtils.getPathForFile no necesita ida y vuelta por IPC.
  getPathForFile: (file) => webUtils.getPathForFile(file),
});
