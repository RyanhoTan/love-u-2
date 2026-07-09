import cors from "cors";
import express from "express";
import type { NextFunction, Request, Response } from "express";
import { isHttpError } from "./errors.js";

const app = express();

interface RequestParseError {
  type?: string;
  status?: number;
  statusCode?: number;
}

function isRequestParseError(error: unknown): error is RequestParseError {
  if (!error || typeof error !== "object") {
    return false;
  }

  return "type" in error && "status" in error;
}

app.use(cors());
app.use(express.json());

// 路由
import userRouter from "./router/user.js";
app.use("/login", userRouter);

app.use((_req, res) => {
  res.status(404).json({ message: "route not found" });
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  void _next;

  if (isHttpError(err)) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }

  if (isRequestParseError(err) && err.type === "entity.parse.failed") {
    res.status(err.statusCode || err.status || 400).json({
      message: "invalid json payload",
    });
    return;
  }

  console.error(err);
  res.status(500).json({ message: "internal server error" });
});

export { app };
