import type { Request } from "express";
import jwt from "jsonwebtoken";
import { config } from "./config.js";
import { HttpError } from "./errors.js";

export interface AuthTokenPayload extends jwt.JwtPayload {
  sub: string;
  username?: string;
}

function getBearerToken(req: Request) {
  const authorization = req.header("Authorization");

  if (!authorization) {
    throw new HttpError(401, "invalid or expired token");
  }

  const [scheme, token] = authorization.split(" ");
  if (scheme !== "Bearer" || !token) {
    throw new HttpError(401, "invalid or expired token");
  }

  return token;
}

export function getAuthTokenPayload(req: Request): AuthTokenPayload {
  const token = getBearerToken(req);

  return verifyAuthToken(token);
}

export function verifyAuthToken(token: string): AuthTokenPayload {
  if (!token) {
    throw new HttpError(401, "invalid or expired token");
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    if (
      !payload ||
      typeof payload !== "object" ||
      typeof payload.sub !== "string" ||
      payload.sub.trim() === ""
    ) {
      throw new HttpError(401, "invalid or expired token");
    }

    return payload as AuthTokenPayload;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError(401, "invalid or expired token");
  }
}

export function getAuthenticatedUserId(req: Request) {
  const auth = getAuthTokenPayload(req);
  const userId = Number(auth.sub);

  if (!Number.isInteger(userId) || userId <= 0) {
    throw new HttpError(401, "invalid or expired token");
  }

  return userId;
}
