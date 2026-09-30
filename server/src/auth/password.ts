import { createHash } from "node:crypto";
import bcrypt from "bcrypt";

export const LEGACY_BCRYPT_INPUT_LIMIT_BYTES = 72;

const PASSWORD_HASH_VERSION = "insync-bcrypt-sha256-v1:";
const PASSWORD_HASH_CONTEXT = "insync-password-v1\0";
const SALT_ROUNDS = 10;

function prehashPassword(password: string) {
  return createHash("sha256")
    .update(PASSWORD_HASH_CONTEXT, "utf8")
    .update(password, "utf8")
    .digest("hex");
}

export async function hashPassword(password: string) {
  const bcryptHash = await bcrypt.hash(prehashPassword(password), SALT_ROUNDS);
  return `${PASSWORD_HASH_VERSION}${bcryptHash}`;
}

export async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<{ valid: boolean; needsRehash: boolean }> {
  if (storedHash.startsWith(PASSWORD_HASH_VERSION)) {
    const bcryptHash = storedHash.slice(PASSWORD_HASH_VERSION.length);
    return {
      valid: await bcrypt.compare(prehashPassword(password), bcryptHash),
      needsRehash: false,
    };
  }

  const valid = await bcrypt.compare(password, storedHash);
  return {
    valid,
    needsRehash:
      valid &&
      Buffer.byteLength(password, "utf8") < LEGACY_BCRYPT_INPUT_LIMIT_BYTES,
  };
}
