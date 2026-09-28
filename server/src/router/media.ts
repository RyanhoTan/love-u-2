import { Router } from "express";
import { getMediaUrl } from "../router_handler/media.js";

const router = Router();

router.get("/:id/url", getMediaUrl);

export default router;
