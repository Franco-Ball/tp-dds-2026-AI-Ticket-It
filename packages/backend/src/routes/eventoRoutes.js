import { Router } from "express";
import { EventoController } from "../controllers/EventoController.js";
import { CompraController } from "../controllers/CompraController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { requireRole } from "../middlewares/requireRole.js";
import { RolUsuario } from "../models/enums.js";

const eventoController = new EventoController();
const compraController = new CompraController();
const router = Router();

router.get("/", (req, res, next) => eventoController.listar(req, res, next));
router.get("/:id", (req, res, next) => eventoController.obtenerPorId(req, res, next));

// Publicar evento (solo Organizador)
router.post(
  "/",
  authMiddleware(),
  requireRole(RolUsuario.ORGANIZADOR),
  (req, res, next) => eventoController.crear(req, res, next)
);

// Visualizar compras asociadas a un evento (solo Organizador dueño - CU-02)
router.get(
  "/:id/compras",
  authMiddleware(),
  requireRole(RolUsuario.ORGANIZADOR),
  (req, res, next) => compraController.comprasDeEvento(req, res, next)
);

export default router;
