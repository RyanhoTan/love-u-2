import { Router } from "express";
import { login, register } from "../router_handler/user.js";

const router = Router();

router.post("/login", login);
router.post("/register", register);

export default router;
