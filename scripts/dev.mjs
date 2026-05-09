import { spawn } from "node:child_process";
import { resolve } from "node:path";

const root = process.cwd();
const pnpmCmd = "pnpm";
const appDir = resolve(root, "app");
const serverDir = resolve(root, "server");

const buildCommand = (dir) => `${pnpmCmd} --dir "${dir}" dev`;

const children = [
  spawn(buildCommand(serverDir), {
    stdio: ["ignore", "inherit", "inherit"],
    shell: true
  }),
  spawn(buildCommand(appDir), {
    stdio: "inherit",
    shell: true
  })
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
  child.on("error", (error) => {
    console.error("Failed to start process:", error.message);
    shutdown("SIGTERM");
    process.exitCode = 1;
  });

  child.on("exit", (code) => {
    if (!isShuttingDown && code && code !== 0) {
      shutdown("SIGTERM");
      process.exitCode = code;
    }
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
