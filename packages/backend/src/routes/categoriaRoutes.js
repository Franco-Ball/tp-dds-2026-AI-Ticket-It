import { Router } from "express";
import { CategoriaController } from "../controllers/CategoriaController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { requireRole } from "../middlewares/requireRole.js";
import { RolUsuario } from "../models/enums.js";

const categoriaController = new CategoriaController();
const router = Router();

router.get("/", (req, res, next) => categoriaController.listar(req, res, next));
router.get("/:id", (req, res, next) => categoriaController.obtenerPorId(req, res, next));
router.post(
  "/",
  authMiddleware(),
  requireRole(RolUsuario.ORGANIZADOR),
  (req, res, next) => categoriaController.crear(req, res, next)
);

export default router;
