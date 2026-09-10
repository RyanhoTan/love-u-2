import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const webRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const input = join(webRoot, "openapi.json");
const output = join(webRoot, "src/api/schemas.d.ts");

/**
 * Apidog OpenAPI 3.1 exports encode nullable $refs as:
 *   { allOf: [{ $ref }], type: "null" }
 * openapi-typescript turns that into `null & T` (effectively unusable).
 * Normalize to oneOf[$ref, null] so generated types become `T | null`.
 * Leaves the on-disk Apidog export untouched.
 */
function normalizeApidogNullableRefs(node) {
  if (Array.isArray(node)) {
    for (const item of node) {
      normalizeApidogNullableRefs(item);
    }
    return;
  }
  if (!node || typeof node !== "object") {
    return;
  }

  if (
    node.type === "null" &&
    Array.isArray(node.allOf) &&
    node.allOf.length === 1 &&
    node.allOf[0] &&
    typeof node.allOf[0] === "object" &&
    "$ref" in node.allOf[0]
  ) {
    const ref = node.allOf[0];
    delete node.allOf;
    delete node.type;
    node.oneOf = [ref, { type: "null" }];
  }

  for (const value of Object.values(node)) {
    normalizeApidogNullableRefs(value);
  }
}

async function main() {
  let openapiTS;
  let astToString;
  try {
    ({ default: openapiTS, astToString } = await import("openapi-typescript"));
  } catch {
    console.error(
      "openapi-typescript is not installed. Run: pnpm --dir web add -D openapi-typescript",
    );
    process.exit(1);
  }

  const schema = JSON.parse(readFileSync(input, "utf8"));
  normalizeApidogNullableRefs(schema);

  const ast = await openapiTS(schema, { rootTypes: true });
  writeFileSync(output, astToString(ast), "utf8");
  console.log(`✨ openapi-typescript → ${output}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
