import { Router } from "express";
import { userLogin, userRegister } from "../controllers/authController";
import { rateLimiter } from "../middleware/rateLimiter";

const router = Router();

router.post("/login", rateLimiter, userLogin);
router.post("/register", rateLimiter, userRegister);

export default router;