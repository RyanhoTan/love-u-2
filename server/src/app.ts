import cors from "cors";
import express from "express";
import type { NextFunction, Request, Response } from "express";

const app = express();

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
  console.error(err);
  res.status(500).json({ message: "internal server error" });
});

export { app };
