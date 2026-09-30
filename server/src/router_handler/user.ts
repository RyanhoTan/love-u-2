import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { RowDataPacket } from "mysql2";
import { hashPassword, verifyPassword } from "../auth/password.js";
import { isMySqlDuplicateEntryError } from "../auth/registration.js";
import { config } from "../config.js";
import db from "../db/index.js";
import { HttpError } from "../errors.js";
import { authSchema } from "../schema/user.js";
import { parseRequestBody } from "../validation.js";

export async function register(req: Request, res: Response) {
  const { username, password } = parseRequestBody(authSchema, req.body);

  const [rows] = await db.query<RowDataPacket[]>(
    "SELECT id FROM users WHERE username = ?",
    [username]
  );

  if (rows.length > 0) {
    throw new HttpError(409, "username already exists");
  }

  const passwordHash = await hashPassword(password);

  try {
    await db.query("INSERT INTO users (username, password_hash) VALUES (?, ?)", [
      username,
      passwordHash
    ]);
  } catch (error) {
    if (isMySqlDuplicateEntryError(error)) {
      throw new HttpError(409, "username already exists");
    }
    throw error;
  }

  res.status(201).json({ message: "register success" });
}

interface UserRow extends RowDataPacket {
  id: number;
  username: string;
  password_hash: string;
}






export async function login(req: Request, res: Response) {
  const { username, password } = parseRequestBody(authSchema, req.body);

  const [rows] = await db.query<UserRow[]>(
    "SELECT id, username, password_hash FROM users WHERE username = ? LIMIT 1",
    [username]
  );

  const user = rows[0];
  if (!user) {
    throw new HttpError(401, "username or password is incorrect");
  }

  const verification = await verifyPassword(password, user.password_hash);
  if (!verification.valid) {
    throw new HttpError(401, "username or password is incorrect");
  }

  if (verification.needsRehash) {
    const passwordHash = await hashPassword(password);
    await db.query(
      `
        UPDATE users
        SET password_hash = ?
        WHERE id = ?
          AND BINARY password_hash = BINARY ?
        LIMIT 1
      `,
      [passwordHash, user.id, user.password_hash],
    );
  }

  const token = jwt.sign(
    {
      sub: String(user.id),
      username: user.username
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );

  res.status(200).json({
    message: "login success",
    token,
    user: {
      id: user.id,
      username: user.username
    }
  });
}
