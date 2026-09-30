import type { Request } from "express";
import { config } from "./config.js";
import {
  getAuthenticatedUserIdFromPayload,
  parseBearerToken,
  verifyAuthToken as verifyAuthTokenWithSecret,
  type AuthTokenPayload,
} from "./auth/token.js";

export type { AuthTokenPayload } from "./auth/token.js";

export function getAuthTokenPayload(req: Request): AuthTokenPayload {
  const token = parseBearerToken(req.header("Authorization"));
  return verifyAuthToken(token);
}

export function verifyAuthToken(token: string): AuthTokenPayload {
  return verifyAuthTokenWithSecret(token, config.jwtSecret);
}

export function getAuthenticatedUserId(req: Request) {
  return getAuthenticatedUserIdFromPayload(getAuthTokenPayload(req));
}
