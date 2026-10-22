import { UnprocessableEntityError } from "../errors/AppError.js";

export class Resenia {
  constructor({
    id = null,
    compradorId,
    eventoId,
    organizadorId,
    puntuacion,
    detalle,
    fecha = new Date().toISOString(),
  } = {}) {
    if (!compradorId || typeof compradorId !== "string" || !compradorId.trim()) {
      throw new UnprocessableEntityError("El id del comprador es requerido");
    }
    if (!eventoId || typeof eventoId !== "string" || !eventoId.trim()) {
      throw new UnprocessableEntityError("El id del evento es requerido");
    }
    if (!organizadorId || typeof organizadorId !== "string" || !organizadorId.trim()) {
      throw new UnprocessableEntityError("El id del organizador es requerido");
    }

    const numPuntuacion = Number(puntuacion);
    if (isNaN(numPuntuacion) || numPuntuacion < 1 || numPuntuacion > 5) {
      throw new UnprocessableEntityError("La puntuación debe ser un número entre 1.0 y 5.0");
    }

    if (!detalle || typeof detalle !== "string" || !detalle.trim()) {
      throw new UnprocessableEntityError("El comentario de la reseña no puede estar vacío");
    }

    this.id = id;
    this.compradorId = compradorId.trim();
    this.eventoId = eventoId.trim();
    this.organizadorId = organizadorId.trim();
    this.puntuacion = Math.round(numPuntuacion * 10) / 10;
    this.detalle = detalle.trim();
    this.fecha = fecha;
  }

  toJSON() {
    return {
      id: this.id,
      compradorId: this.compradorId,
      eventoId: this.eventoId,
      organizadorId: this.organizadorId,
      puntuacion: this.puntuacion,
      detalle: this.detalle,
      fecha: this.fecha,
    };
  }
}
