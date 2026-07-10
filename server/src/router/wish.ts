import { Router } from "express";
import {
  createWish,
  createWishRecord,
  getWishById,
  getWishRecords,
  getWishes,
} from "../router_handler/wish.js";

const router = Router();

router.get("/", getWishes);
router.get("/:id/records", getWishRecords);
router.post("/:id/records", createWishRecord);
router.get("/:id", getWishById);
router.post("/", createWish);

export default router;
