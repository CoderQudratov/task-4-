import { Router } from "express";
import { register, login, me, logout, verifyEmail } from "../controllers/auth.controller";
import { auth } from "../middleware/auth";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

// IMPORTANT: auth middleware validates the JWT cookie before me() runs
router.get("/me", auth, me);

router.get("/verify/:token", verifyEmail);

export default router;
