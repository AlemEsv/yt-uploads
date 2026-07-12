const path = require("path");
const { app, BrowserWindow, Menu } = require("electron");
const { BackendProcess } = require("./backend-process");
const { registerIpcHandlers } = require("./ipc-handlers");

let mainWindow = null;
const backendProcess = new BackendProcess({ isPackaged: app.isPackaged });

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 600,
    backgroundColor: "#000101",
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, "..", "preload", "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  if (app.isPackaged) {
    mainWindow.loadFile(path.join(__dirname, "..", "..", "dist", "index.html"));
  } else {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.on("console-message", (event) => {
      console.log(`[renderer] ${event.message} (${event.sourceId}:${event.lineNumber})`);
    });
  }

  backendProcess.on("status", (status) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("backend:status", status);
    }
  });

  mainWindow.on("maximize", () => mainWindow.webContents.send("window:maximized-change", true));
  mainWindow.on("unmaximize", () => mainWindow.webContents.send("window:maximized-change", false));
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  registerIpcHandlers({ backendProcess, getMainWindow: () => mainWindow });
  createWindow();
  backendProcess.start().catch((err) => {
    console.error("[main] no se pudo iniciar el backend:", err);
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  backendProcess.stop();
});
