import { z } from "zod";
import { CategoriaService } from "../services/CategoriaService.js";
import { BadRequestError, UnprocessableEntityError } from "../errors/AppError.js";

const crearCategoriaEsquema = z.object({
  nombre: z.string().min(1, "El nombre de la categoría es obligatorio"),
  descripcion: z.string().optional(),
}).strict();

export class CategoriaController {
  constructor(categoriaService = new CategoriaService()) {
    this.categoriaService = categoriaService;
  }

  listar = async (req, res, next) => {
    try {
      const categorias = await this.categoriaService.listarTodas();
      return res.status(200).json(categorias);
    } catch (error) {
      return next(error);
    }
  };

  obtenerPorId = async (req, res, next) => {
    try {
      const categoria = await this.categoriaService.obtenerPorId(req.params.id);
      return res.status(200).json(categoria);
    } catch (error) {
      return next(error);
    }
  };

  crear = async (req, res, next) => {
    try {
      const datosValidados = this.validarBody(crearCategoriaEsquema, req.body);
      const categoria = await this.categoriaService.crearCategoria(datosValidados);
      return res.status(201).json(categoria);
    } catch (error) {
      return next(error);
    }
  };

  validarBody(esquema, body) {
    const resultado = esquema.safeParse(body);
    if (resultado.success) {
      return resultado.data;
    }

    const esEstructural = resultado.error.issues.some(
      (issue) => issue.code === "invalid_type" || issue.code === "unrecognized_keys"
    );

    const mensaje = resultado.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ");
    if (esEstructural) {
      throw new BadRequestError(`Error de formato en la solicitud: ${mensaje}`);
    }
    throw new UnprocessableEntityError(`Error de validación semántica: ${mensaje}`);
  }
}
