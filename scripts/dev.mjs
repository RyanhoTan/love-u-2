import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import { resolve } from "node:path";

const root = process.cwd();
const appDir = resolve(root, "app");
const serverDir = resolve(root, "server");

const projects = [
  { name: "server", dir: serverDir, stdio: ["ignore", "inherit", "inherit"] },
  { name: "app", dir: appDir, stdio: "inherit" },
];

const missingDeps = projects.filter(
  ({ dir }) => !existsSync(resolve(dir, "node_modules")),
);

if (missingDeps.length > 0) {
  console.error("Missing dependencies in:");

  for (const project of missingDeps) {
    console.error(`- ${project.name}: ${project.dir}`);
  }

  console.error("");
  console.error("Run `pnpm run install:all` from the repository root,");
  console.error("or install each project separately with:");
  console.error("- `pnpm --dir app install`");
  console.error("- `pnpm --dir server install`");
  process.exit(1);
}

const buildCommand = (dir) => `pnpm --dir "${dir}" dev`;

const spawnProject = ({ dir, stdio }) =>
  spawn(buildCommand(dir), {
    stdio,
    shell: true,
  });

const children = projects.map(spawnProject);

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
          // Ignore shutdown errors and continue cleanup.
        }
        resolveStop();
      });
      return;
    }

    try {
      child.kill(signal);
    } catch {
      // Ignore shutdown errors and continue cleanup.
    }

    resolveStop();
  });

const shutdown = async (signal) => {
  if (isShuttingDown) return;
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
