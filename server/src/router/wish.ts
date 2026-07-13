import { Router } from "express";
import {
  createWish,
  createWishRecord,
  getWishById,
  getWishRecords,
  getWishes,
  updateWish,
} from "../router_handler/wish.js";

const router = Router();

router.get("/", getWishes);
router.get("/:id/records", getWishRecords);
router.post("/:id/records", createWishRecord);
router.get("/:id", getWishById);
router.patch("/:id", updateWish);
router.post("/", createWish);

export default router;
