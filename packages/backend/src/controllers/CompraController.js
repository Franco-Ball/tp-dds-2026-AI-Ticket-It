import { z } from "zod";
import { CompraService } from "../services/CompraService.js";
import { EstadoCompra } from "../models/enums.js";
import { BadRequestError, UnprocessableEntityError } from "../errors/AppError.js";

const crearCompraEsquema = z.object({
  eventoId: z.string().min(1, "El ID del evento es requerido"),
  tipoEntradaId: z.string().min(1, "El ID del tipo de entrada es requerido"),
  cantidad: z.number().int().positive("La cantidad debe ser un número entero mayor a 0"),
}).strict();

const registrarPagoEsquema = z.object({
  metodoPago: z.string().optional().default("TARJETA_SIMULADA"),
}).strict();

const actualizarEstadoEsquema = z.object({
  estado: z.nativeEnum(EstadoCompra, {
    errorMap: () => ({ message: "Estado de compra inválido" }),
  }),
  motivo: z.string().optional().default(""),
}).strict();

export class CompraController {
  constructor(compraService = new CompraService()) {
    this.compraService = compraService;
  }

  crear = async (req, res, next) => {
    try {
      const datosValidados = this.validarBody(crearCompraEsquema, req.body);
      const compradorId = req.user.id;
      const compra = await this.compraService.crearCompra({
        ...datosValidados,
        compradorId,
      });
      return res.status(201).json(compra);
    } catch (error) {
      return next(error);
    }
  };

  registrarPago = async (req, res, next) => {
    try {
      const datosValidados = this.validarBody(registrarPagoEsquema, req.body || {});
      const compraId = req.params.id;
      const usuarioId = req.user.id;
      const compraConfirmada = await this.compraService.registrarPago(
        compraId,
        usuarioId,
        datosValidados
      );
      return res.status(200).json(compraConfirmada);
    } catch (error) {
      return next(error);
    }
  };

  actualizarEstado = async (req, res, next) => {
    try {
      const datosValidados = this.validarBody(actualizarEstadoEsquema, req.body);
      const compraId = req.params.id;
      const usuarioId = req.user.id;
      const rolUsuario = req.user.rol;

      const compraActualizada = await this.compraService.actualizarEstado(
        compraId,
        usuarioId,
        rolUsuario,
        datosValidados.estado,
        datosValidados.motivo
      );
      return res.status(200).json(compraActualizada);
    } catch (error) {
      return next(error);
    }
  };

  misCompras = async (req, res, next) => {
    try {
      const compradorId = req.user.id;
      const compras = await this.compraService.obtenerMisCompras(compradorId);
      return res.status(200).json(compras);
    } catch (error) {
      return next(error);
    }
  };

  comprasDeEvento = async (req, res, next) => {
    try {
      const eventoId = req.params.id;
      const organizadorId = req.user.id;
      const resultado = await this.compraService.obtenerComprasDeEvento(
        eventoId,
        organizadorId
      );
      return res.status(200).json(resultado);
    } catch (error) {
      return next(error);
    }
  };

  obtenerPorId = async (req, res, next) => {
    try {
      const compraId = req.params.id;
      const usuarioId = req.user.id;
      const rolUsuario = req.user.rol;
      const compra = await this.compraService.obtenerPorId(
        compraId,
        usuarioId,
        rolUsuario
      );
      return res.status(200).json(compra);
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
