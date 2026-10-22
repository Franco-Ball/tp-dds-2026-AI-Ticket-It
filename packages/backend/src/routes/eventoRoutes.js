import { Router } from "express";
import { EventoController } from "../controllers/EventoController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { requireRole } from "../middlewares/requireRole.js";
import { RolUsuario } from "../models/enums.js";

const eventoController = new EventoController();
const router = Router();

router.get("/", (req, res, next) => eventoController.listar(req, res, next));
router.get("/:id", (req, res, next) => eventoController.obtenerPorId(req, res, next));
router.post(
  "/",
  authMiddleware(),
  requireRole(RolUsuario.ORGANIZADOR),
  (req, res, next) => eventoController.crear(req, res, next)
);

export default router;
