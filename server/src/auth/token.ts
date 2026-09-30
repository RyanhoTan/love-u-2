import jwt from "jsonwebtoken";
import { HttpError } from "../errors.js";

export interface AuthTokenPayload extends jwt.JwtPayload {
  sub: string;
  username?: string;
}

function unauthorized(): never {
  throw new HttpError(401, "invalid or expired token");
}

export function parseBearerToken(authorization: string | undefined) {
  if (!authorization) {
    return unauthorized();
  }

  const [scheme, token] = authorization.split(" ");
  if (scheme !== "Bearer" || !token) {
    return unauthorized();
  }

  return token;
}

export function verifyAuthToken(token: string, secret: string): AuthTokenPayload {
  if (!token) {
    return unauthorized();
  }

  try {
    const payload = jwt.verify(token, secret);
    if (
      !payload ||
      typeof payload !== "object" ||
      typeof payload.sub !== "string" ||
      payload.sub.trim() === ""
    ) {
      return unauthorized();
    }

    return payload as AuthTokenPayload;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }

    return unauthorized();
  }
}

export function getAuthenticatedUserIdFromPayload(auth: AuthTokenPayload) {
  const userId = Number(auth.sub);
  if (!Number.isInteger(userId) || userId <= 0) {
    return unauthorized();
  }

  return userId;
}
