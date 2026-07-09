import { Router } from "express";
import { getUserInfo } from "../router_handler/userinfo.js";

const router = Router();

router.get("/", getUserInfo);

export default router;
