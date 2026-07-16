import { Router } from "express";
import { uploadMedia } from "../router_handler/upload.js";

const router = Router();

router.post("/media", uploadMedia);

export default router;
