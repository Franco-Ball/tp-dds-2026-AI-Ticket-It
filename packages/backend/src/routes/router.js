import { Router } from "express";
import AuthRoutes from "./AuthRoutes.js";
import CategoriaRoutes from "./categoriaRoutes.js";
import EventoRoutes from "./eventoRoutes.js";
import OrganizadorRoutes from "./organizadorRoutes.js";

const router = Router();

router.use("/auth", AuthRoutes);
router.use("/categorias", CategoriaRoutes);
router.use("/eventos", EventoRoutes);
router.use("/organizadores", OrganizadorRoutes);

export default router;
