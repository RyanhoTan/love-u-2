import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import type { NextFunction, Request, Response } from "express";
import { prisma } from "./prisma.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 3001);

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString()
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
