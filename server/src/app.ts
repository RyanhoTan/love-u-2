import cors from "cors";
import express from "express";
import type { NextFunction, Request, Response } from "express";
import { isDatabaseConfigured } from "./db.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    databaseConfigured: isDatabaseConfigured()
  });
});

app.use("/api/auth", (_req, res) => {
  res.status(501).json({
    message: "auth module has been cleared and is waiting to be rebuilt"
  });
});

app.use("/api/todos", (_req, res) => {
  res.status(501).json({
    message: "todo module has been cleared and is waiting to be rebuilt"
  });
});

app.use((_req, res) => {
  res.status(404).json({ message: "route not found" });
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  void _next;
  console.error(err);
  res.status(500).json({ message: "internal server error" });
});

export { app };
