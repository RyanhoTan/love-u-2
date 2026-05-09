import { spawn } from "node:child_process";
import { resolve } from "node:path";

const root = process.cwd();
const pnpmCmd = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const appDir = resolve(root, "app");
const serverDir = resolve(root, "server");

const children = [
  spawn(pnpmCmd, ["--dir", serverDir, "dev"], { stdio: "inherit" }),
  spawn(pnpmCmd, ["--dir", appDir, "dev"], { stdio: "inherit" })
];

let isShuttingDown = false;

const shutdown = (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  for (const child of children) {
    if (!child.killed) {
      child.kill(signal);
    }
  }
};

for (const child of children) {
  child.on("exit", (code) => {
    if (!isShuttingDown && code && code !== 0) {
      shutdown("SIGTERM");
      process.exitCode = code;
    }
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
