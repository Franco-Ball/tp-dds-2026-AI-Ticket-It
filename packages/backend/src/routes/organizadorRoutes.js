import { Router } from "express";
import { EventoController } from "../controllers/EventoController.js";
import { ReseniaController } from "../controllers/ReseniaController.js";

const eventoController = new EventoController();
const reseniaController = new ReseniaController();
const router = Router();

router.get("/:id/eventos", (req, res, next) =>
  eventoController.listarPorOrganizador(req, res, next)
);

// Reseñas históricas y cálculo de reputación del organizador (CU-10)
router.get("/:id/resenias", (req, res, next) =>
  reseniaController.listarPorOrganizador(req, res, next)
);

export default router;
