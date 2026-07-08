import dotenv from "dotenv";

dotenv.config();

const portValue = Number(process.env.PORT ?? 3001);

export const config = {
  port: Number.isInteger(portValue) && portValue > 0 ? portValue : 3001,
  mysqlUrl: process.env.MYSQL_URL?.trim() || ""
};
