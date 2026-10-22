import { UnprocessableEntityError } from "../errors/AppError.js";

export class Mensaje {
  constructor({
    id = null,
    compraId,
    usuarioId,
    mensaje,
    fechaEnvio = new Date().toISOString(),
  } = {}) {
    if (!compraId || typeof compraId !== "string" || !compraId.trim()) {
      throw new UnprocessableEntityError("El id de la compra es requerido");
    }
    if (!usuarioId || typeof usuarioId !== "string" || !usuarioId.trim()) {
      throw new UnprocessableEntityError("El id del usuario emisor es requerido");
    }
    if (!mensaje || typeof mensaje !== "string" || !mensaje.trim()) {
      throw new UnprocessableEntityError("El contenido del mensaje no puede estar vacío");
    }

    this.id = id;
    this.compraId = compraId.trim();
    this.usuarioId = usuarioId.trim();
    this.mensaje = mensaje.trim();
    this.fechaEnvio = fechaEnvio;
  }

  toJSON() {
    return {
      id: this.id,
      compraId: this.compraId,
      usuarioId: this.usuarioId,
      mensaje: this.mensaje,
      fechaEnvio: this.fechaEnvio,
    };
  }
}
