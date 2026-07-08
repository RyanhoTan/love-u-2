import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import type { RowDataPacket } from "mysql2";
import db from "../db/index.js";

const SALT_ROUNDS = 10;

export async function register(req: Request, res: Response) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ message: "username and password are required" });
      return;
    }

    if (typeof username !== "string" || typeof password !== "string") {
      res.status(400).json({ message: "invalid request payload" });
      return;
    }

    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT id FROM users WHERE username = ?",
      [username]
    );

    if (rows.length > 0) {
      res.status(409).json({ message: "username already exists" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    await db.query("INSERT INTO users (username, password_hash) VALUES (?, ?)", [
      username,
      passwordHash
    ]);

    res.status(201).json({ message: "register success" });
  } catch (err) {
    console.error("register error:", err);
    res.status(500).json({ message: "internal server error" });
  }
}
