import { request } from "../lib/api";

export type LoginResponse = {
  message: string;
  token: string;
  user: {
    id: number;
    username: string;
  };
};

export type RegisterResponse = {
  message: string;
};

export function login(username: string, password: string) {
  return request<LoginResponse>("/user/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export function register(username: string, password: string) {
  return request<RegisterResponse>("/user/register", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}
