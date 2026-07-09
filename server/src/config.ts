import dotenv from "dotenv";
import type { SignOptions } from "jsonwebtoken";

dotenv.config();

const portValue = Number(process.env.PORT ?? 3001);
const jwtSecret = process.env.JWT_SECRET?.trim() || "";
const jwtExpiresIn = (process.env.JWT_EXPIRES_IN?.trim() || "7d") as SignOptions["expiresIn"];

if (!jwtSecret) {
  throw new Error("JWT_SECRET is required");
}

export const config = {
  port: Number.isInteger(portValue) && portValue > 0 ? portValue : 3001,
  mysqlUrl: process.env.MYSQL_URL?.trim() || "",
  jwtSecret,
  jwtExpiresIn
};
