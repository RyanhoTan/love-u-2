import { Router } from "express";
import {
  deleteWish,
  createWish,
  createWishRecord,
  getDeletedWishes,
  getWishById,
  getWishRecords,
  getWishes,
  permanentlyDeleteWish,
  restoreWish,
  updateWish,
} from "../router_handler/wish.js";

const router = Router();

router.get("/", getWishes);
router.get("/recycle", getDeletedWishes);
router.get("/:id/records", getWishRecords);
router.post("/:id/records", createWishRecord);
router.post("/:id/restore", restoreWish);
router.delete("/:id/permanent", permanentlyDeleteWish);
router.get("/:id", getWishById);
router.patch("/:id", updateWish);
router.delete("/:id", deleteWish);
router.post("/", createWish);

export default router;
