import assert from "node:assert/strict";
import bcrypt from "bcrypt";
import { describe, it } from "node:test";
import {
  hashPassword,
  LEGACY_BCRYPT_INPUT_LIMIT_BYTES,
  verifyPassword,
} from "../src/auth/password.js";

describe("versioned password hashes", () => {
  it("distinguishes full UTF-8 passwords beyond bcrypt's legacy byte limit", async () => {
    const prefix = "😀".repeat(18);
    assert.equal(
      Buffer.byteLength(prefix, "utf8"),
      LEGACY_BCRYPT_INPUT_LIMIT_BYTES,
    );
    const password = `${prefix}first suffix`;
    const hash = await hashPassword(password);

    assert.ok(hash.startsWith("insync-bcrypt-sha256-v1:"));
    assert.ok(hash.length < 255);
    assert.deepEqual(await verifyPassword(password, hash), {
      valid: true,
      needsRehash: false,
    });
    assert.deepEqual(await verifyPassword(`${prefix}other suffix`, hash), {
      valid: false,
      needsRehash: false,
    });
  });
});

describe("legacy bcrypt password compatibility", () => {
  it("accepts a valid legacy password below 72 UTF-8 bytes and requests upgrade", async () => {
    const password = `${"a".repeat(67)}😀`;
    assert.equal(Buffer.byteLength(password, "utf8"), 71);
    const legacyHash = await bcrypt.hash(password, 4);

    assert.deepEqual(await verifyPassword(password, legacyHash), {
      valid: true,
      needsRehash: true,
    });
    assert.deepEqual(await verifyPassword(`${password}x`, legacyHash), {
      valid: false,
      needsRehash: false,
    });
  });

  it("preserves existing 72-byte truncation behavior for ambiguous long passwords", async () => {
    const prefix = "a".repeat(LEGACY_BCRYPT_INPUT_LIMIT_BYTES);
    const legacyHash = await bcrypt.hash(prefix, 4);

    assert.deepEqual(await verifyPassword(`${prefix}first suffix`, legacyHash), {
      valid: true,
      needsRehash: false,
    });
    assert.deepEqual(await verifyPassword(`${prefix}other suffix`, legacyHash), {
      valid: true,
      needsRehash: false,
    });
  });
});
