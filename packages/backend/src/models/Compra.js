import { UnprocessableEntityError } from "../errors/AppError.js";
import { EstadoCompra } from "./enums.js";
import { CambioEstadoCompra } from "./CambioEstadoCompra.js";

const TRANSICIONES_VALIDAS = {
  [EstadoCompra.PENDIENTE]: [EstadoCompra.CONFIRMADA, EstadoCompra.CANCELADA],
  [EstadoCompra.CONFIRMADA]: [EstadoCompra.UTILIZADA, EstadoCompra.REEMBOLSADA],
  [EstadoCompra.UTILIZADA]: [],
  [EstadoCompra.CANCELADA]: [],
  [EstadoCompra.REEMBOLSADA]: [],
};

export class Compra {
  constructor({
    id = null,
    compradorId,
    eventoId,
    tipoEntradaId,
    cantidad,
    precioUnitario,
    total = null,
    estado = EstadoCompra.PENDIENTE,
    fechaCompra = new Date().toISOString(),
    fechaExpiracion = null,
    historialEstados = [],
  } = {}) {
    if (!compradorId || typeof compradorId !== "string") {
      throw new UnprocessableEntityError("El id del comprador es requerido");
    }
    if (!eventoId || typeof eventoId !== "string") {
      throw new UnprocessableEntityError("El id del evento es requerido");
    }
    if (!tipoEntradaId || typeof tipoEntradaId !== "string") {
      throw new UnprocessableEntityError("El id del tipo de entrada es requerido");
    }

    const numCantidad = Number(cantidad);
    if (isNaN(numCantidad) || !Number.isInteger(numCantidad) || numCantidad <= 0) {
      throw new UnprocessableEntityError("La cantidad debe ser un número entero mayor a 0");
    }

    const numPrecio = Number(precioUnitario);
    if (isNaN(numPrecio) || numPrecio < 0) {
      throw new UnprocessableEntityError("El precio unitario debe ser un número mayor o igual a 0");
    }

    if (!Object.values(EstadoCompra).includes(estado)) {
      throw new UnprocessableEntityError(`Estado de compra inválido: '${estado}'`);
    }

    this.id = id;
    this.compradorId = compradorId;
    this.eventoId = eventoId;
    this.tipoEntradaId = tipoEntradaId;
    this.cantidad = numCantidad;
    this.precioUnitario = numPrecio;
    this.total = total !== null ? Number(total) : numCantidad * numPrecio;
    this.estado = estado;
    this.fechaCompra = fechaCompra;

    // Si es PENDIENTE y no se proveyó fecha de expiración, vence a los 15 minutos
    if (this.estado === EstadoCompra.PENDIENTE && !fechaExpiracion) {
      const fechaCompraMs = new Date(this.fechaCompra).getTime();
      this.fechaExpiracion = new Date(fechaCompraMs + 15 * 60 * 1000).toISOString();
    } else {
      this.fechaExpiracion = fechaExpiracion;
    }

    // Instanciar historial de estados
    this.historialEstados = historialEstados.map((h, index) => {
      if (h instanceof CambioEstadoCompra) return h;
      return new CambioEstadoCompra({
        ...h,
        id: h.id || `cambio-${index + 1}`,
        compraId: this.id || "compra-tmp",
      });
    });

    // Si el historial está vacío, registrar el estado inicial
    if (this.historialEstados.length === 0) {
      this.historialEstados.push(
        new CambioEstadoCompra({
          id: `cambio-1`,
          compraId: this.id || "compra-tmp",
          estadoAnterior: null,
          estadoNuevo: this.estado,
          quienId: this.compradorId,
          fechaHora: this.fechaCompra,
          motivo: "Creación inicial de la compra",
        })
      );
    }
  }

  haExpirado(ahora = new Date()) {
    if (this.estado !== EstadoCompra.PENDIENTE) {
      return false;
    }
    if (!this.fechaExpiracion) {
      return false;
    }
    return new Date(this.fechaExpiracion).getTime() < ahora.getTime();
  }

  actualizarEstado(nuevoEstado, quienId, motivo = "") {
    if (!Object.values(EstadoCompra).includes(nuevoEstado)) {
      throw new UnprocessableEntityError(`Estado inválido: '${nuevoEstado}'`);
    }

    const permitidos = TRANSICIONES_VALIDAS[this.estado] || [];
    if (!permitidos.includes(nuevoEstado)) {
      throw new UnprocessableEntityError(
        `Transición no permitida de '${this.estado}' a '${nuevoEstado}'. Transiciones válidas: [${permitidos.join(", ")}]`
      );
    }

    const estadoAnterior = this.estado;
    this.estado = nuevoEstado;

    const cambio = new CambioEstadoCompra({
      id: `cambio-${this.historialEstados.length + 1}`,
      compraId: this.id,
      estadoAnterior,
      estadoNuevo: nuevoEstado,
      quienId,
      fechaHora: new Date().toISOString(),
      motivo,
    });

    this.historialEstados.push(cambio);
    return cambio;
  }

  calcularDiasFaltantes(fechaEvento, ahora = new Date()) {
    if (this.estado !== EstadoCompra.CONFIRMADA) {
      return null;
    }

    const diffMs = new Date(fechaEvento).getTime() - ahora.getTime();
    const dias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (dias < 0) {
      return {
        diasFaltantes: 0,
        eventoFinalizado: true,
      };
    }

    return {
      diasFaltantes: dias,
      eventoFinalizado: false,
    };
  }

  toJSON() {
    return {
      id: this.id,
      compradorId: this.compradorId,
      eventoId: this.eventoId,
      tipoEntradaId: this.tipoEntradaId,
      cantidad: this.cantidad,
      precioUnitario: this.precioUnitario,
      total: this.total,
      estado: this.estado,
      fechaCompra: this.fechaCompra,
      fechaExpiracion: this.fechaExpiracion,
      historialEstados: this.historialEstados.map((h) => h.toJSON()),
    };
  }
}
