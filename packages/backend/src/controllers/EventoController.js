import { z } from "zod";
import { EventoService } from "../services/EventoService.js";
import { BadRequestError, UnprocessableEntityError } from "../errors/AppError.js";

const tipoEntradaEsquema = z.object({
  id: z.string().optional(),
  nombre: z.string().min(1, "El nombre del tipo de entrada es requerido"),
  descripcion: z.string().optional().default(""),
  precio: z.number().min(0, "El precio debe ser mayor o igual a 0"),
  cupoTotal: z.number().int().positive("El cupo total debe ser un número entero mayor a 0"),
  cupoDisponible: z.number().int().min(0).optional(),
});

const crearEventoEsquema = z.object({
  nombre: z.string().min(1, "El nombre del evento es requerido"),
  descripcion: z.string().min(1, "La descripción del evento es requerida"),
  categoriaId: z.string().min(1, "La categoría es requerida"),
  fecha: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "La fecha del evento debe ser una fecha válida en formato ISO",
  }),
  multimedia: z.array(z.string().url("Cada elemento multimedia debe ser una URL válida")).optional().default([]),
  tiposEntrada: z.array(tipoEntradaEsquema).min(1, "Debe incluir al menos un tipo de entrada"),
}).strict();

export class EventoController {
  constructor(eventoService = new EventoService()) {
    this.eventoService = eventoService;
  }

  crear = async (req, res, next) => {
    try {
      const datosValidados = this.validarBody(crearEventoEsquema, req.body);
      const organizadorId = req.user.id;
      const nuevoEvento = await this.eventoService.crearEvento({
        ...datosValidados,
        organizadorId,
      });
      return res.status(201).json(nuevoEvento);
    } catch (error) {
      return next(error);
    }
  };

  listar = async (req, res, next) => {
    try {
      const {
        q,
        categoria,
        minPrecio,
        maxPrecio,
        organizadorId,
        sortBy,
        order,
      } = req.query;

      const eventos = await this.eventoService.listarEventos({
        q,
        categoriaId: categoria,
        minPrecio: minPrecio ? Number(minPrecio) : null,
        maxPrecio: maxPrecio ? Number(maxPrecio) : null,
        organizadorId,
        sortBy: sortBy || "fecha",
        order: order || "asc",
      });

      return res.status(200).json(eventos);
    } catch (error) {
      return next(error);
    }
  };

  obtenerPorId = async (req, res, next) => {
    try {
      const evento = await this.eventoService.obtenerPorId(req.params.id);
      return res.status(200).json(evento);
    } catch (error) {
      return next(error);
    }
  };

  listarPorOrganizador = async (req, res, next) => {
    try {
      const eventos = await this.eventoService.listarPorOrganizador(req.params.id);
      return res.status(200).json(eventos);
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
