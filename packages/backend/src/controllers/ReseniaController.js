import { z } from "zod";
import { ReseniaService } from "../services/ReseniaService.js";
import { BadRequestError, UnprocessableEntityError } from "../errors/AppError.js";

const crearReseniaEsquema = z.object({
  puntuacion: z
    .number()
    .min(1, "La puntuación mínima es 1.0")
    .max(5, "La puntuación máxima es 5.0"),
  detalle: z
    .string()
    .min(1, "El comentario de la reseña es requerido")
    .max(1000, "El comentario no puede exceder los 1000 caracteres"),
}).strict();

export class ReseniaController {
  constructor(reseniaService = new ReseniaService()) {
    this.reseniaService = reseniaService;
  }

  crear = async (req, res, next) => {
    try {
      const datosValidados = this.validarBody(crearReseniaEsquema, req.body);
      const eventoId = req.params.id;
      const compradorId = req.user.id;

      const nuevaResenia = await this.reseniaService.crearResenia({
        compradorId,
        eventoId,
        puntuacion: datosValidados.puntuacion,
        detalle: datosValidados.detalle,
      });

      return res.status(201).json(nuevaResenia);
    } catch (error) {
      return next(error);
    }
  };

  listarPorEvento = async (req, res, next) => {
    try {
      const eventoId = req.params.id;
      const resenias = await this.reseniaService.obtenerReseniasDeEvento(eventoId);
      return res.status(200).json(resenias);
    } catch (error) {
      return next(error);
    }
  };

  listarPorOrganizador = async (req, res, next) => {
    try {
      const organizadorId = req.params.id;
      const resultado = await this.reseniaService.obtenerReseniasDeOrganizador(organizadorId);
      return res.status(200).json(resultado);
    } catch (error) {
      return next(error);
    }
  };

  validarBody(esquema, body = {}) {
    const resultado = esquema.safeParse(body || {});
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
