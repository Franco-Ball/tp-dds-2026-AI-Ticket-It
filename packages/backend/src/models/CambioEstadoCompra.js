import { UnprocessableEntityError } from "../errors/AppError.js";
import { EstadoCompra } from "./enums.js";

export class CambioEstadoCompra {
  constructor({
    id = null,
    compraId,
    estadoAnterior = null,
    estadoNuevo,
    quienId,
    fechaHora = new Date().toISOString(),
    motivo = "",
  } = {}) {
    if (!compraId || typeof compraId !== "string") {
      throw new UnprocessableEntityError("El id de la compra es requerido");
    }
    if (!estadoNuevo || !Object.values(EstadoCompra).includes(estadoNuevo)) {
      throw new UnprocessableEntityError(`Estado nuevo inválido: '${estadoNuevo}'`);
    }
    if (!quienId || typeof quienId !== "string") {
      throw new UnprocessableEntityError("El id del usuario que realiza la transición es requerido");
    }

    this.id = id;
    this.compraId = compraId;
    this.estadoAnterior = estadoAnterior;
    this.estadoNuevo = estadoNuevo;
    this.quienId = quienId;
    this.fechaHora = fechaHora;
    this.motivo = typeof motivo === "string" ? motivo.trim() : "";
  }

  toJSON() {
    return {
      id: this.id,
      compraId: this.compraId,
      estadoAnterior: this.estadoAnterior,
      estadoNuevo: this.estadoNuevo,
      quienId: this.quienId,
      fechaHora: this.fechaHora,
      motivo: this.motivo,
    };
  }
}
