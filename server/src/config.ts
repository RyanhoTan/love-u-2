import dotenv from "dotenv";
import type { SignOptions } from "jsonwebtoken";

dotenv.config();

const portValue = Number(process.env.PORT ?? 3001);
const jwtExpiresIn = (process.env.JWT_EXPIRES_IN?.trim() || "7d") as SignOptions["expiresIn"];

function getRequiredEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

export const config = {
  port: Number.isInteger(portValue) && portValue > 0 ? portValue : 3001,
  mysqlUrl: getRequiredEnv("MYSQL_URL"),
  jwtSecret: getRequiredEnv("JWT_SECRET"),
  jwtExpiresIn,
  r2Bucket: getRequiredEnv("R2_BUCKET"),
  r2Endpoint: getRequiredEnv("R2_ENDPOINT"),
  r2AccessKeyId: getRequiredEnv("R2_ACCESS_KEY_ID"),
  r2SecretAccessKey: getRequiredEnv("R2_SECRET_ACCESS_KEY"),
  r2PublicUrl: getRequiredEnv("R2_PUBLIC_URL"),
};
