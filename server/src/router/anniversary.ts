import { Router } from "express";
import {
  createAnniversary,
  getAnniversaries,
} from "../router_handler/anniversary.js";

const router = Router();

router.get("/", getAnniversaries);
router.post("/", createAnniversary);

export default router;
