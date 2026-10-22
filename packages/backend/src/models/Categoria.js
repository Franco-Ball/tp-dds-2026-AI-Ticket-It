import { UnprocessableEntityError } from "../errors/AppError.js";

export class Categoria {
  constructor({ id = null, nombre, descripcion = "" } = {}) {
    if (!nombre || typeof nombre !== "string" || !nombre.trim()) {
      throw new UnprocessableEntityError("El nombre de la categoría es requerido y no puede estar vacío");
    }

    this.id = id;
    this.nombre = nombre.trim();
    this.descripcion = typeof descripcion === "string" ? descripcion.trim() : "";
  }

  toJSON() {
    return {
      id: this.id,
      nombre: this.nombre,
      descripcion: this.descripcion,
    };
  }
}
