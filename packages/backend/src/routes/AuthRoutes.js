import { Router } from "express";
import { AuthController } from "../controllers/AuthController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();
const authController = new AuthController();

router.post("/register", authController.registrar);
router.post("/login", authController.login);
router.get("/me", authMiddleware(), authController.me);

export default router;
