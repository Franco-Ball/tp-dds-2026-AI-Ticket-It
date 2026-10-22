import { Router } from "express";
import AuthRoutes from "./AuthRoutes.js";
import CategoriaRoutes from "./categoriaRoutes.js";
import EventoRoutes from "./eventoRoutes.js";
import OrganizadorRoutes from "./organizadorRoutes.js";
import CompraRoutes from "./compraRoutes.js";

const router = Router();

router.use("/auth", AuthRoutes);
router.use("/categorias", CategoriaRoutes);
router.use("/eventos", EventoRoutes);
router.use("/organizadores", OrganizadorRoutes);
router.use("/compras", CompraRoutes);

export default router;
