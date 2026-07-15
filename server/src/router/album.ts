import { Router } from "express";
import { createAlbumMedia, getAlbumMedia } from "../router_handler/album.js";

const router = Router();

router.get("/media", getAlbumMedia);
router.post("/media", createAlbumMedia);

export default router;
