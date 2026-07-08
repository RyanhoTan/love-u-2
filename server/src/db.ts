import { createPool, type Pool } from "mysql2/promise";
import { config } from "./config.js";

let pool: Pool | null = null;

export function isDatabaseConfigured() {
  return Boolean(config.mysqlUrl);
}

export function getDbPool() {
  if (!config.mysqlUrl) {
    throw new Error("MYSQL_URL is not configured");
  }

  if (!pool) {
    pool = createPool({
      uri: config.mysqlUrl,
      connectionLimit: 10,
      waitForConnections: true,
      queueLimit: 0
    });
  }

  return pool;
}

export async function closeDbPool() {
  if (!pool) {
    return;
  }

  await pool.end();
  pool = null;
}
