import { Router } from "express";
import { getUserInfo, updateUserInfo } from "../router_handler/userinfo.js";

const router = Router();

router.get("/", getUserInfo);
router.put("/", updateUserInfo);

export default router;
