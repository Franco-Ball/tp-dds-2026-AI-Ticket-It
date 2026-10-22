import { UnprocessableEntityError } from "../errors/AppError.js";

export class TipoEntrada {
  constructor({
    id = null,
    nombre,
    descripcion = "",
    precio,
    cupoTotal,
    cupoDisponible = null,
  } = {}) {
    if (!nombre || typeof nombre !== "string" || !nombre.trim()) {
      throw new UnprocessableEntityError("El nombre del tipo de entrada es requerido");
    }

    const numPrecio = Number(precio);
    if (isNaN(numPrecio) || numPrecio < 0) {
      throw new UnprocessableEntityError("El precio debe ser un número mayor o igual a 0");
    }

    const numCupoTotal = Number(cupoTotal);
    if (isNaN(numCupoTotal) || !Number.isInteger(numCupoTotal) || numCupoTotal <= 0) {
      throw new UnprocessableEntityError("El cupo total debe ser un número entero mayor a 0");
    }

    const numCupoDisponible = cupoDisponible !== null ? Number(cupoDisponible) : numCupoTotal;
    if (isNaN(numCupoDisponible) || !Number.isInteger(numCupoDisponible) || numCupoDisponible < 0 || numCupoDisponible > numCupoTotal) {
      throw new UnprocessableEntityError("El cupo disponible debe ser un número entero entre 0 y el cupo total");
    }

    this.id = id;
    this.nombre = nombre.trim();
    this.descripcion = typeof descripcion === "string" ? descripcion.trim() : "";
    this.precio = numPrecio;
    this.cupoTotal = numCupoTotal;
    this.cupoDisponible = numCupoDisponible;
  }

  hayCupoPara(cantidad) {
    const cant = Number(cantidad);
    if (isNaN(cant) || !Number.isInteger(cant) || cant <= 0) {
      return false;
    }
    return this.cupoDisponible >= cant;
  }

  decrementarCupo(cantidad) {
    const cant = Number(cantidad);
    if (!this.hayCupoPara(cant)) {
      throw new UnprocessableEntityError(
        `Cupo insuficiente para el tipo de entrada '${this.nombre}'. Disponibles: ${this.cupoDisponible}, solicitados: ${cantidad}`
      );
    }
    this.cupoDisponible -= cant;
    return this.cupoDisponible;
  }

  reintegrarCupo(cantidad) {
    const cant = Number(cantidad);
    if (isNaN(cant) || !Number.isInteger(cant) || cant <= 0) {
      throw new UnprocessableEntityError("La cantidad a reintegrar debe ser un entero positivo");
    }
    this.cupoDisponible = Math.min(this.cupoTotal, this.cupoDisponible + cant);
    return this.cupoDisponible;
  }

  toJSON() {
    return {
      id: this.id,
      nombre: this.nombre,
      descripcion: this.descripcion,
      precio: this.precio,
      cupoTotal: this.cupoTotal,
      cupoDisponible: this.cupoDisponible,
    };
  }
}
