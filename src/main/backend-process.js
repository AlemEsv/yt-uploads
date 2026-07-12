const { spawn } = require("child_process");
const http = require("http");
const path = require("path");
const { EventEmitter } = require("events");

const READY_PREFIX = "SOUNDDOCK_BACKEND_READY ";
const HEALTHCHECK_INTERVAL_MS = 300;
const HEALTHCHECK_TIMEOUT_MS = 10000;
const MAX_RESTART_ATTEMPTS = 3;

function resolveLaunchCommand(isPackaged) {
  const repoRoot = path.join(__dirname, "..", "..");

  if (isPackaged) {
    // TODO(feature/packaging): reemplazar por el ejecutable de PyInstaller en
    // process.resourcesPath/backend/sounddock-backend.exe una vez exista esa rama.
    return {
      cmd: path.join(process.resourcesPath, "backend", "sounddock-backend.exe"),
      args: [],
      cwd: path.join(process.resourcesPath, "backend"),
    };
  }

  return {
    cmd: path.join(repoRoot, ".venv", "Scripts", "python.exe"),
    args: ["run_dev.py"],
    cwd: path.join(repoRoot, "backend"),
  };
}

function healthcheck(host, port) {
  return new Promise((resolve, reject) => {
    const req = http.get({ host, port, path: "/health", timeout: 1000 }, (res) => {
      res.resume();
      if (res.statusCode === 200) {
        resolve();
      } else {
        reject(new Error(`Healthcheck respondió ${res.statusCode}`));
      }
    });
    req.on("error", reject);
    req.on("timeout", () => req.destroy(new Error("Healthcheck timeout")));
  });
}

async function waitForHealthy(host, port, timeoutMs) {
  const deadline = Date.now() + timeoutMs;

  while (true) {
    try {
      await healthcheck(host, port);
      return;
    } catch (err) {
      if (Date.now() > deadline) throw err;
      await new Promise((r) => setTimeout(r, HEALTHCHECK_INTERVAL_MS));
    }
  }
}

class BackendProcess extends EventEmitter {
  constructor({ isPackaged }) {
    super();
    this.isPackaged = isPackaged;
    this.child = null;
    this.config = { httpBaseUrl: null, wsUrl: null, ready: false };
    this.status = "starting";
    this.restartCount = 0;
    this.intentionalShutdown = false;
    this._stdoutBuffer = "";
  }

  getConfig() {
    return { ...this.config, ready: this.status === "ready" };
  }

  _setStatus(status) {
    this.status = status;
    this.emit("status", status);
  }

  async start() {
    this.intentionalShutdown = false;
    this._setStatus(this.restartCount > 0 ? "restarting" : "starting");

    const { cmd, args, cwd } = resolveLaunchCommand(this.isPackaged);
    this.child = spawn(cmd, args, { cwd, windowsHide: true });

    this.child.stdout.on("data", (chunk) => this._handleStdout(chunk));
    this.child.stderr.on("data", (chunk) => {
      console.error("[backend]", chunk.toString());
    });
    this.child.on("exit", () => this._handleExit());
    this.child.on("error", (err) => {
      console.error("[backend] failed to spawn:", err);
    });

    const { host, port } = await this._waitForReadySignal();
    await waitForHealthy(host, port, HEALTHCHECK_TIMEOUT_MS);

    this.config = {
      httpBaseUrl: `http://${host}:${port}`,
      wsUrl: `ws://${host}:${port}/ws`,
      ready: true,
    };
    this.restartCount = 0;
    this._setStatus("ready");
  }

  _handleStdout(chunk) {
    this._stdoutBuffer += chunk.toString();
    const lines = this._stdoutBuffer.split("\n");
    this._stdoutBuffer = lines.pop();
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith(READY_PREFIX) && this._onReadySignal) {
        const payload = JSON.parse(trimmed.slice(READY_PREFIX.length));
        this._onReadySignal(payload);
      }
    }
  }

  _waitForReadySignal() {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this._onReadySignal = null;
        reject(new Error("Timeout esperando el handshake del backend"));
      }, HEALTHCHECK_TIMEOUT_MS);

      this._onReadySignal = (payload) => {
        clearTimeout(timeout);
        this._onReadySignal = null;
        resolve(payload);
      };
    });
  }

  _handleExit() {
    this.config = { httpBaseUrl: null, wsUrl: null, ready: false };

    if (this.intentionalShutdown) {
      return;
    }

    this._setStatus("crashed");

    if (this.restartCount < MAX_RESTART_ATTEMPTS) {
      this.restartCount += 1;
      const delay = 1000 * this.restartCount;
      setTimeout(() => {
        this.start().catch((err) => {
          console.error("[backend] reintento falló:", err);
        });
      }, delay);
    }
  }

  stop() {
    this.intentionalShutdown = true;
    if (this.child && !this.child.killed) {
      this.child.kill();
    }
  }
}

module.exports = { BackendProcess };
