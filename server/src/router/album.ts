import { Router } from "express";
import {
  createAlbumMedia,
  createAlbumStory,
  getFavoriteAlbumStories,
  getAlbumMedia,
  getAlbumStories,
  getAlbumStory,
  updateAlbumStoryFavorite,
} from "../router_handler/album.js";

const router = Router();

router.get("/media", getAlbumMedia);
router.post("/media", createAlbumMedia);
router.get("/stories", getAlbumStories);
router.get("/stories/favorites", getFavoriteAlbumStories);
router.get("/stories/:id", getAlbumStory);
router.post("/stories", createAlbumStory);
router.post("/stories/:id/favorite", updateAlbumStoryFavorite);

export default router;
