import { copyFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const envFile = resolve(process.cwd(), ".env");
const envExampleFile = resolve(process.cwd(), ".env.example");

if (!existsSync(envFile) && existsSync(envExampleFile)) {
  copyFileSync(envExampleFile, envFile);
  console.log("Created .env from .env.example");
}
