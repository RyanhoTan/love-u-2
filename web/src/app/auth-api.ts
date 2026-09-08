import { request, type AuthUser } from "../lib/api";

export type LoginResponse = {
  message: string;
  token: string;
  user: AuthUser;
};

export function login(username: string, password: string) {
  return request<LoginResponse>("/user/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}
