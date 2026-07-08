import { app } from "./app.js";
import { closeDbPool } from "./db.js";
import { config } from "./config.js";

const server = app.listen(config.port, () => {
  console.log(`Server listening on http://localhost:${config.port}`);
});

const shutdown = async () => {
  await closeDbPool();
  server.close(() => {
    process.exit(0);
  });
};

process.on("SIGINT", () => {
  void shutdown();
});

process.on("SIGTERM", () => {
  void shutdown();
});
