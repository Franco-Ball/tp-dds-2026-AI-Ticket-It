import { z } from "zod";
import { ChatService } from "../services/ChatService.js";
import { BadRequestError, UnprocessableEntityError } from "../errors/AppError.js";

const enviarMensajeEsquema = z.object({
  mensaje: z
    .string()
    .min(1, "El mensaje no puede estar vacío")
    .max(1000, "El mensaje no puede exceder los 1000 caracteres"),
}).strict();

export class ChatController {
  constructor(chatService = new ChatService()) {
    this.chatService = chatService;
  }

  enviarMensaje = async (req, res, next) => {
    try {
      const datosValidados = this.validarBody(enviarMensajeEsquema, req.body);
      const compraId = req.params.id;
      const usuarioId = req.user.id;

      const mensajeCreado = await this.chatService.enviarMensaje({
        compraId,
        usuarioId,
        mensaje: datosValidados.mensaje,
      });

      return res.status(201).json(mensajeCreado);
    } catch (error) {
      return next(error);
    }
  };

  obtenerHistorial = async (req, res, next) => {
    try {
      const compraId = req.params.id;
      const usuarioId = req.user.id;

      const historial = await this.chatService.obtenerHistorial(compraId, usuarioId);
      return res.status(200).json(historial);
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
