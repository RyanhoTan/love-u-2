import { Router } from "express";
import {
  createAnniversary,
  deleteAnniversary,
  getAnniversaries,
  updateAnniversary,
} from "../router_handler/anniversary.js";

const router = Router();

router.get("/", getAnniversaries);
router.post("/", createAnniversary);
router.patch("/:id", updateAnniversary);
router.delete("/:id", deleteAnniversary);

export default router;
