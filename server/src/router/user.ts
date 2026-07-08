import { Router } from "express";
import { register } from "../router_handler/user.js";

const router = Router();

router.post("/register", register);

export default router;
