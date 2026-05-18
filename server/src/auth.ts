import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const TOKEN_SECRET = process.env.AUTH_SECRET ?? "dev-auth-secret";

export const DEMO_USERNAME = process.env.DEMO_USERNAME ?? "demo";
export const DEMO_PASSWORD = process.env.DEMO_PASSWORD ?? "123456";

export function hashPassword(password: string) {
  return createHash("sha256").update(password).digest("hex");
}

export function verifyPassword(password: string, passwordHash: string) {
  const inputHash = Buffer.from(hashPassword(password), "hex");
  const storedHash = Buffer.from(passwordHash, "hex");

  if (inputHash.length !== storedHash.length) {
    return false;
  }

  return timingSafeEqual(inputHash, storedHash);
}

export function createToken(userId: number, username: string) {
  const payload = JSON.stringify({
    userId,
    username,
    iat: Date.now(),
    nonce: randomBytes(8).toString("hex")
  });
  const body = Buffer.from(payload).toString("base64url");
  const signature = createHmac("sha256", TOKEN_SECRET).update(body).digest("base64url");

  return `${body}.${signature}`;
}

export function verifyToken(token: string) {
  const [body, signature] = token.split(".");

  if (!body || !signature) {
    return null;
  }

  const expected = createHmac("sha256", TOKEN_SECRET).update(body).digest("base64url");

  if (signature !== expected) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as {
      userId?: number;
      username?: string;
    };

    if (typeof payload.userId !== "number" || typeof payload.username !== "string") {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
