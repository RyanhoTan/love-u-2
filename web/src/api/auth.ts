import { request } from "@/api/client";
import type {
  SchemaAuthCredentials,
  SchemaLoginResponse,
  SchemaRegisterResponse,
} from "@/api/schemas";

export type LoginResponse = SchemaLoginResponse;
export type RegisterResponse = SchemaRegisterResponse;

export function login(username: string, password: string) {
  const body: SchemaAuthCredentials = { username, password };
  return request<SchemaLoginResponse>("/user/login", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function register(username: string, password: string) {
  const body: SchemaAuthCredentials = { username, password };
  return request<SchemaRegisterResponse>("/user/register", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
