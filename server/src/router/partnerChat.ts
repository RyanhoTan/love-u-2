import { Router } from "express";
import { getPartnerChatAudioUrl } from "../router_handler/partnerChat.js";

const router = Router();

router.get("/messages/:id/audio-url", getPartnerChatAudioUrl);

export default router;
