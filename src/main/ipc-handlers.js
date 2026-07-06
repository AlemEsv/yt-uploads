const { ipcMain, dialog, shell } = require("electron");

function registerIpcHandlers({ backendProcess, getMainWindow }) {
  ipcMain.handle("backend:get-config", () => backendProcess.getConfig());

  ipcMain.handle("dialog:choose-mp3-files", async () => {
    const win = getMainWindow();
    const result = await dialog.showOpenDialog(win, {
      title: "Importar canciones",
      properties: ["openFile", "multiSelections"],
      filters: [{ name: "MP3", extensions: ["mp3"] }],
    });
    return result.canceled ? [] : result.filePaths;
  });

  ipcMain.handle("shell:show-in-folder", (_event, absolutePath) => {
    shell.showItemInFolder(absolutePath);
  });
}

module.exports = { registerIpcHandlers };
