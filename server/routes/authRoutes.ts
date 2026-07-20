import { Router } from "express";
import { AuthController } from "../controllers/authController.ts";
import { authenticateToken } from "../middleware/auth.ts";

const router = Router();

// Public routes
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);

// Protected routes
router.get("/me", authenticateToken as any, AuthController.getMe as any);

export default router;
