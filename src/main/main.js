const path = require("path");
const { app, BrowserWindow, Menu, Tray, nativeImage } = require("electron");
const { BackendProcess } = require("./backend-process");
const { registerIpcHandlers } = require("./ipc-handlers");

let mainWindow = null;
let miniWindow = null;
let tray = null;
let forceQuit = false;
const backendProcess = new BackendProcess({ isPackaged: app.isPackaged });

const appIconPath = path.join(__dirname, "..", "..", "build", "icon.ico");
const trayIconPath = path.join(__dirname, "..", "..", "build", "tray-icon.png");

function createTray() {
  const icon = nativeImage.createFromPath(trayIconPath);
  tray = new Tray(icon);
  tray.setToolTip("SoundDock");
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Mostrar SoundDock",
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      },
    },
    { type: "separator" },
    {
      label: "Salir",
      click: () => {
        forceQuit = true;
        app.quit();
      },
    },
  ]);
  tray.setContextMenu(contextMenu);
  tray.on("double-click", () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

function createMiniWindow() {
  if (miniWindow && !miniWindow.isDestroyed()) {
    miniWindow.show();
    miniWindow.focus();
    return;
  }
  miniWindow = new BrowserWindow({
    width: 380,
    height: 90,
    frame: false,
    // Windows no maneja bien la transparencia real por píxel en ventanas frameless
    // (deja esquinas negras sin suavizar) — en vez de eso se usa un fondo opaco y se
    // deja que Windows 11 redondee la ventana de forma nativa (roundedCorners).
    backgroundColor: "#0a0a0a",
    roundedCorners: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, "..", "preload", "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  if (app.isPackaged) {
    miniWindow.loadFile(path.join(__dirname, "..", "..", "dist", "index.html"), {
      hash: "mini",
    });
  } else {
    miniWindow.loadURL("http://localhost:5173/#mini");
  }

  miniWindow.on("closed", () => {
    miniWindow = null;
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 600,
    backgroundColor: "#000000",
    icon: appIconPath,
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

  // Interceptar cierre → ocultar en bandeja (reproducción en segundo plano)
  mainWindow.on("close", (event) => {
    if (!forceQuit) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  // Minimizar → mostrar mini widget
  mainWindow.on("minimize", (event) => {
    event.preventDefault();
    mainWindow.hide();
    createMiniWindow();
  });
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  registerIpcHandlers({
    backendProcess,
    getMainWindow: () => mainWindow,
    getMiniWindow: () => miniWindow,
  });
  createWindow();
  createTray();
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
    // No salir — la ventana se oculta, el backend sigue corriendo
  }
});

app.on("before-quit", () => {
  forceQuit = true;
  backendProcess.stop();
});
