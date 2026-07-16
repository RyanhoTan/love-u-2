import { Router } from "express";
import {
  createAlbumMedia,
  createAlbumStory,
  getAlbumMedia,
  getAlbumStories,
  getAlbumStory,
} from "../router_handler/album.js";

const router = Router();

router.get("/media", getAlbumMedia);
router.post("/media", createAlbumMedia);
router.get("/stories", getAlbumStories);
router.get("/stories/:id", getAlbumStory);
router.post("/stories", createAlbumStory);

export default router;
