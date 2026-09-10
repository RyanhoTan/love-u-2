import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const webRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const input = join(webRoot, "openapi.json");
const output = join(webRoot, "src/api/schemas.d.ts");

function resolveCli() {
  // Resolve via package.json: openapi-typescript's exports map remaps
  // `*.js` → `*.mjs`, so require.resolve(".../bin/cli.js") looks for a
  // non-existent cli.mjs and falsely reports the package as missing.
  const require = createRequire(join(webRoot, "package.json"));
  const pkgPath = require.resolve("openapi-typescript/package.json");
  const { bin } = require(pkgPath);
  const binEntry =
    typeof bin === "string" ? bin : bin?.["openapi-typescript"];
  if (!binEntry) {
    throw new Error("openapi-typescript package.json has no bin entry");
  }
  return join(dirname(pkgPath), binEntry);
}

let cli;
try {
  cli = resolveCli();
} catch {
  console.error(
    "openapi-typescript is not installed. Run: pnpm --dir web add -D openapi-typescript",
  );
  process.exit(1);
}

const result = spawnSync(
  process.execPath,
  [cli, input, "-o", output, "--root-types"],
  { stdio: "inherit", cwd: webRoot },
);

process.exit(result.status ?? 1);
