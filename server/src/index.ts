import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import type { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "./prisma.js";
import { createToken, DEMO_PASSWORD, DEMO_USERNAME, hashPassword, verifyPassword, verifyToken } from "./auth.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 3001);

app.use(cors());
app.use(express.json());

const ensureDemoUser = async () => {
  await prisma.$executeRaw`
    INSERT OR IGNORE INTO "User" ("username", "passwordHash", "createdAt", "updatedAt")
    VALUES (${DEMO_USERNAME}, ${hashPassword(DEMO_PASSWORD)}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `;
};

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString()
  });
});

app.post("/api/auth/login", async (req, res) => {
  const username = typeof req.body?.username === "string" ? req.body.username.trim() : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";

  if (!username || !password) {
    res.status(400).json({ message: "username and password are required" });
    return;
  }

  const users = await prisma.$queryRaw<
    Array<{ id: number; username: string; passwordHash: string }>
  >(Prisma.sql`
    SELECT "id", "username", "passwordHash"
    FROM "User"
    WHERE "username" = ${username}
    LIMIT 1
  `);
  const user = users[0];

  if (!user || !verifyPassword(password, user.passwordHash)) {
    res.status(401).json({ message: "invalid username or password" });
    return;
  }

  const token = createToken(user.id, user.username);

  res.status(200).json({
    token,
    user: {
      id: user.id,
      username: user.username
    }
  });
});

app.get("/api/auth/me", async (req, res) => {
  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  const payload = token ? verifyToken(token) : null;

  if (!payload) {
    res.status(401).json({ message: "unauthorized" });
    return;
  }

  const users = await prisma.$queryRaw<Array<{ id: number; username: string }>>(
    Prisma.sql`
      SELECT "id", "username"
      FROM "User"
      WHERE "id" = ${payload.userId}
      LIMIT 1
    `
  );
  const user = users[0];

  if (!user) {
    res.status(401).json({ message: "unauthorized" });
    return;
  }

  res.status(200).json({
    user: {
      id: user.id,
      username: user.username
    }
  });
});

app.get("/api/todos", async (_req, res) => {
  const todos = await prisma.todo.findMany({
    orderBy: { id: "desc" }
  });
  res.status(200).json(todos);
});

app.post("/api/todos", async (req, res) => {
  const title = typeof req.body?.title === "string" ? req.body.title.trim() : "";

  if (!title) {
    res.status(400).json({ message: "title is required" });
    return;
  }

  const todo = await prisma.todo.create({
    data: { title }
  });

  res.status(201).json(todo);
});

app.patch("/api/todos/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ message: "invalid id" });
    return;
  }

  const existing = await prisma.todo.findUnique({ where: { id } });

  if (!existing) {
    res.status(404).json({ message: "todo not found" });
    return;
  }

  const updated = await prisma.todo.update({
    where: { id },
    data: { completed: !existing.completed }
  });

  res.status(200).json(updated);
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ message: "internal server error" });
});

const start = async () => {
  await ensureDemoUser();

  const server = app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });

  const shutdown = async () => {
    await prisma.$disconnect();
    server.close(() => {
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
};

start().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
