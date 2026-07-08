import mysql from "mysql2/promise";
import { config } from "../config.js";

const db = mysql.createPool(config.mysqlUrl);

export default db;
