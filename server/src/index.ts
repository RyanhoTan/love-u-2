import { createServer } from "node:http";
import { app } from "./app.js";
import { config } from "./config.js";
import { setupWishCleanup } from "./router_handler/wish.js";
import { setupPartnerChat } from "./ws/partnerChat.js";

const server = createServer(app);

setupPartnerChat(server);
setupWishCleanup();

server.listen(config.port, () => {
  console.log(`Server running at http://localhost:${config.port}`);
  console.log(`Partner chat websocket ready at ws://localhost:${config.port}/partner-chat`);
});
