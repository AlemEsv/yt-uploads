const { ipcMain, dialog, shell, app } = require("electron");

function registerIpcHandlers({ backendProcess, getMainWindow, getMiniWindow }) {
  ipcMain.handle("backend:get-config", () => backendProcess.getConfig());

  ipcMain.handle("window:minimize", () => getMainWindow()?.minimize());

  ipcMain.handle("window:toggle-maximize", () => {
    const win = getMainWindow();
    if (!win) return;
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
  });

  // Cierra al tray (no sale de la app)
  ipcMain.handle("window:close", () => getMainWindow()?.hide());

  // Sale completamente de la aplicación
  ipcMain.handle("window:quit", () => {
    app.quit();
  });

  // Restaura la ventana principal desde el mini widget
  ipcMain.handle("window:restore-main", () => {
    const win = getMainWindow();
    const mini = getMiniWindow?.();
    if (win) {
      win.show();
      win.focus();
    }
    if (mini && !mini.isDestroyed()) {
      mini.close();
    }
  });

  ipcMain.handle("window:is-maximized", () => getMainWindow()?.isMaximized() ?? false);

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

  ipcMain.handle("dialog:choose-image-file", async () => {
    const win = getMainWindow();
    const result = await dialog.showOpenDialog(win, {
      title: "Elegir portada",
      properties: ["openFile"],
      filters: [{ name: "Imagen", extensions: ["jpg", "jpeg", "png"] }],
    });
    return result.canceled ? null : result.filePaths[0];
  });

  ipcMain.handle("dialog:choose-folder", async () => {
    const win = getMainWindow();
    const result = await dialog.showOpenDialog(win, {
      title: "Elegir carpeta de descarga",
      properties: ["openDirectory"],
    });
    return result.canceled ? null : result.filePaths[0];
  });

  ipcMain.handle("dialog:save-backup", async () => {
    const win = getMainWindow();
    const result = await dialog.showSaveDialog(win, {
      title: "Exportar respaldo",
      defaultPath: "sounddock-backup.sounddockbak",
      filters: [{ name: "Respaldo SoundDock", extensions: ["sounddockbak"] }],
    });
    return result.canceled ? null : result.filePath;
  });

  ipcMain.handle("dialog:open-backup", async () => {
    const win = getMainWindow();
    const result = await dialog.showOpenDialog(win, {
      title: "Importar respaldo",
      properties: ["openFile"],
      filters: [{ name: "Respaldo SoundDock", extensions: ["sounddockbak", "db"] }],
    });
    return result.canceled ? null : result.filePaths[0];
  });
}

module.exports = { registerIpcHandlers };
