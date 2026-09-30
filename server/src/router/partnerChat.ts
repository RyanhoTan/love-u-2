import { Router } from "express";
import {
  getPartnerChatAudioUrl,
  getPartnerChatHistory,
} from "../router_handler/partnerChat.js";

const router = Router();

router.get("/messages", getPartnerChatHistory);
router.get("/messages/:id/audio-url", getPartnerChatAudioUrl);

export default router;
