import { Router } from "express";
import { createWish, getWishById, getWishes } from "../router_handler/wish.js";

const router = Router();

router.get("/", getWishes);
router.get("/:id", getWishById);
router.post("/", createWish);

export default router;
