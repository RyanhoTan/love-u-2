import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import type { RowDataPacket } from "mysql2";
import { z } from "zod";
import db from "../db/index.js";
import { HttpError } from "../errors.js";
import { parseRequestBody } from "../validation.js";

const SALT_ROUNDS = 10;
const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, "username is required"),
  password: z
    .string()
    .min(1, "password is required"),
});

export async function register(req: Request, res: Response) {
  const { username, password } = parseRequestBody(registerSchema, req.body);

  const [rows] = await db.query<RowDataPacket[]>(
    "SELECT id FROM users WHERE username = ?",
    [username]
  );

  if (rows.length > 0) {
    throw new HttpError(409, "username already exists");
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  await db.query("INSERT INTO users (username, password_hash) VALUES (?, ?)", [
    username,
    passwordHash
  ]);

  res.status(201).json({ message: "register success" });
}
