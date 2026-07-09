import { Router } from "express";
import {
  bindCoupleSpace,
  createCoupleInvite,
  getCoupleSpace,
  unbindCoupleSpace,
  updateCoupleSpace,
} from "../router_handler/couple.js";

const router = Router();

router.get("/", getCoupleSpace);
router.post("/invite", createCoupleInvite);
router.post("/bind", bindCoupleSpace);
router.patch("/", updateCoupleSpace);
router.delete("/bind", unbindCoupleSpace);

export default router;
