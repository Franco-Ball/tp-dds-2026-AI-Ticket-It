import { Router } from "express";
import { EventoController } from "../controllers/EventoController.js";

const eventoController = new EventoController();
const router = Router();

router.get("/:id/eventos", (req, res, next) =>
  eventoController.listarPorOrganizador(req, res, next)
);

export default router;
