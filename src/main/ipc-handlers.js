const { ipcMain } = require("electron");

function registerIpcHandlers({ backendProcess }) {
  ipcMain.handle("backend:get-config", () => backendProcess.getConfig());
}

module.exports = { registerIpcHandlers };
