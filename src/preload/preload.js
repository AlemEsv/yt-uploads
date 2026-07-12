const { contextBridge, ipcRenderer, webUtils } = require("electron");

contextBridge.exposeInMainWorld("sounddock", {
  getBackendConfig: () => ipcRenderer.invoke("backend:get-config"),

  onBackendStatusChange: (callback) => {
    const wrapped = (_event, status) => callback(status);
    ipcRenderer.on("backend:status", wrapped);
    return () => ipcRenderer.removeListener("backend:status", wrapped);
  },

  chooseMp3Files: () => ipcRenderer.invoke("dialog:choose-mp3-files"),
  chooseImageFile: () => ipcRenderer.invoke("dialog:choose-image-file"),
  showItemInFolder: (absolutePath) => ipcRenderer.invoke("shell:show-in-folder", absolutePath),
  chooseFolder: () => ipcRenderer.invoke("dialog:choose-folder"),
  chooseBackupExportPath: () => ipcRenderer.invoke("dialog:save-backup"),
  chooseBackupImportPath: () => ipcRenderer.invoke("dialog:open-backup"),

  minimizeWindow: () => ipcRenderer.invoke("window:minimize"),
  toggleMaximizeWindow: () => ipcRenderer.invoke("window:toggle-maximize"),
  // Ahora "cerrar" oculta al tray; para salir completamente usar quitApp
  closeWindow: () => ipcRenderer.invoke("window:close"),
  quitApp: () => ipcRenderer.invoke("window:quit"),
  restoreMain: () => ipcRenderer.invoke("window:restore-main"),
  isWindowMaximized: () => ipcRenderer.invoke("window:is-maximized"),
  onWindowMaximizedChange: (callback) => {
    const wrapped = (_event, isMaximized) => callback(isMaximized);
    ipcRenderer.on("window:maximized-change", wrapped);
    return () => ipcRenderer.removeListener("window:maximized-change", wrapped);
  },

  // Sincrónico: webUtils.getPathForFile no necesita ida y vuelta por IPC.
  getPathForFile: (file) => webUtils.getPathForFile(file),

  notifyPlayerState: (state) => ipcRenderer.send("player:state-changed", state),
  getPlayerState: () => ipcRenderer.invoke("player:get-state"),
  onPlayerStateChange: (callback) => {
    const wrapped = (_event, state) => callback(state);
    ipcRenderer.on("player:state", wrapped);
    return () => ipcRenderer.removeListener("player:state", wrapped);
  },
  sendPlayerCommand: (action) => ipcRenderer.send("player:command", action),
  onPlayerCommand: (callback) => {
    const wrapped = (_event, action) => callback(action);
    ipcRenderer.on("player:command", wrapped);
    return () => ipcRenderer.removeListener("player:command", wrapped);
  },
});
