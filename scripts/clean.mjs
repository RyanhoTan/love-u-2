import { existsSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const rootDir = process.cwd();
const deleteFailures = [];

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

const isWindows = process.platform === "win32";

const printDeleteFailure = ({ relativePath, error }) => {
  console.error(`Failed to remove ${relativePath}`);

  if (
    isWindows &&
    (error.code === "EPERM" || error.code === "EBUSY" || error.code === "ENOTEMPTY")
  ) {
    console.error("The directory appears to be in use by another process.");
    console.error("Common causes: Expo/Metro, pnpm dev, node.exe, VS Code TypeScript/ESLint.");
    console.error("Try closing related terminals or run:");
    console.error(
      "Get-CimInstance Win32_Process | Where-Object { $_.Name -eq 'node.exe' -and $_.CommandLine -match 'love-u-2|expo|pnpm' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }",
    );
    return;
  }

  console.error(error.message);
};

const removePath = (relativePath) => {
  const absolutePath = resolve(rootDir, relativePath);
  if (!existsSync(absolutePath)) {
    return;
  }

  console.log(`Removing ${relativePath}`);

  try {
    rmSync(absolutePath, { force: true, recursive: true });
  } catch (error) {
    deleteFailures.push({ relativePath, error });
    printDeleteFailure({ relativePath, error });
  }
};

for (const relativePath of pathsToRemove) {
  removePath(relativePath);
}

if (deleteFailures.length > 0) {
  console.error("");
  console.error("Clean aborted because some paths could not be removed:");
  for (const failure of deleteFailures) {
    console.error(`- ${failure.relativePath}`);
  }
  process.exit(1);
}

const run = (command, args) => {
  console.log(`Running: ${command} ${args.join(" ")}`);

  const result = spawnSync(command, args, {
    cwd: rootDir,
    stdio: "inherit",
    shell: isWindows,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

run("pnpm", ["store", "prune"]);
run("pnpm", ["install:all"]);
