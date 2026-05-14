import { spawn } from "node:child_process";

const buildCommand = (scriptName) => `pnpm run ${scriptName}`;
const children = [
  spawn(buildCommand("assets:watch"), {
    stdio: ["ignore", "inherit", "inherit"],
    shell: true,
    windowsHide: true,
  }),
  spawn(buildCommand("start"), {
    stdio: "inherit",
    shell: true,
    windowsHide: true,
  }),
];

let isShuttingDown = false;

const stopChild = (child, signal) =>
  new Promise((resolveStop) => {
    if (!child.pid || child.killed) {
      resolveStop();
      return;
    }

    if (process.platform === "win32") {
      const killer = spawn(
        "taskkill",
        ["/pid", String(child.pid), "/t", "/f"],
        {
          stdio: "ignore",
          shell: false,
          windowsHide: true,
        },
      );

      killer.on("exit", () => resolveStop());
      killer.on("error", () => {
        try {
          child.kill(signal);
        } catch {
          resolveStop();
          return;
        }

        resolveStop();
      });
      return;
    }

    try {
      child.kill(signal);
    } catch {
      resolveStop();
      return;
    }

    resolveStop();
  });

const shutdown = async (signal) => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  await Promise.all(children.map((child) => stopChild(child, signal)));
};

const shutdownAndExit = (signal, exitCode = process.exitCode ?? 0) => {
  void shutdown(signal).finally(() => {
    process.exit(exitCode);
  });
};

for (const child of children) {
  child.on("error", (error) => {
    console.error("Failed to start process:", error.message);
    process.exitCode = 1;
    shutdownAndExit("SIGTERM", 1);
  });

  child.on("exit", (code) => {
    if (!isShuttingDown && code && code !== 0) {
      process.exitCode = code;
      shutdownAndExit("SIGTERM", code);
    }
  });
}

process.on("SIGINT", () => shutdownAndExit("SIGINT", process.exitCode ?? 0));
process.on("SIGTERM", () => shutdownAndExit("SIGTERM", process.exitCode ?? 0));
