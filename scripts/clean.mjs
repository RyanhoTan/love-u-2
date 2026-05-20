import { existsSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const rootDir = process.cwd();

const pathsToRemove = [
  "app/.pnpm",
  "app/node_modules",
  "server/node_modules",
  "app/.expo",
  "app/android/.gradle",
  "app/android/build",
  "app/android/app/build",
  "server/dist",
  ".pnpm-store",
];

for (const relativePath of pathsToRemove) {
  const absolutePath = resolve(rootDir, relativePath);
  if (!existsSync(absolutePath)) {
    continue;
  }

  console.log(`Removing ${relativePath}`);
  rmSync(absolutePath, { force: true, recursive: true });
}

const run = (command, args) => {
  console.log(`Running: ${command} ${args.join(" ")}`);

  const result = spawnSync(command, args, {
    cwd: rootDir,
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

run("pnpm", ["store", "prune"]);
run("pnpm", ["install:all"]);
