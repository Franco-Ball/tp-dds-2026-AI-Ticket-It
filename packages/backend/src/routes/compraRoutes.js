import { Router } from "express";
import { CompraController } from "../controllers/CompraController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { requireRole } from "../middlewares/requireRole.js";
import { RolUsuario } from "../models/enums.js";

const compraController = new CompraController();
const router = Router();

// Adquisición de entradas (Comprador)
router.post(
  "/",
  authMiddleware(),
  requireRole(RolUsuario.COMPRADOR),
  (req, res, next) => compraController.crear(req, res, next)
);

// Mis compras (Comprador)
router.get(
  "/mis-compras",
  authMiddleware(),
  requireRole(RolUsuario.COMPRADOR),
  (req, res, next) => compraController.misCompras(req, res, next)
);

// Registrar pago de la compra
router.post(
  "/:id/pagos",
  authMiddleware(),
  (req, res, next) => compraController.registrarPago(req, res, next)
);

// Actualización de estado (REST puro: cancelar, reembolsar, utilizar)
router.patch(
  "/:id/estado",
  authMiddleware(),
  (req, res, next) => compraController.actualizarEstado(req, res, next)
);

// Detalle de compra
router.get(
  "/:id",
  authMiddleware(),
  (req, res, next) => compraController.obtenerPorId(req, res, next)
);

export default router;
