import { RolUsuario } from "./enums.js";
import { UnprocessableEntityError } from "../errors/AppError.js";

export class Usuario {
  constructor({
    id = null,
    nombre,
    apellido,
    email,
    passwordHash,
    rol = RolUsuario.COMPRADOR,
    favoritos = [],
    fechaCreacion = new Date().toISOString(),
  }) {
    if (!nombre || typeof nombre !== "string" || !nombre.trim()) {
      throw new UnprocessableEntityError("El nombre es requerido y no puede estar vacío");
    }
    if (!apellido || typeof apellido !== "string" || !apellido.trim()) {
      throw new UnprocessableEntityError("El apellido es requerido y no puede estar vacío");
    }
    if (!email || typeof email !== "string" || !email.includes("@")) {
      throw new UnprocessableEntityError("El email ingresado no es válido");
    }
    if (!Object.values(RolUsuario).includes(rol)) {
      throw new UnprocessableEntityError(`Rol inválido: '${rol}'. Debe ser COMPRADOR u ORGANIZADOR.`);
    }

    this.id = id;
    this.nombre = nombre.trim();
    this.apellido = apellido.trim();
    this.email = email.trim().toLowerCase();
    this.passwordHash = passwordHash;
    this.rol = rol;
    this.favoritos = Array.isArray(favoritos) ? [...favoritos] : [];
    this.fechaCreacion = fechaCreacion;
  }

  esComprador() {
    return this.rol === RolUsuario.COMPRADOR;
  }

  esOrganizador() {
    return this.rol === RolUsuario.ORGANIZADOR;
  }

  agregarFavorito(eventoId) {
    if (!eventoId) return;
    if (!this.favoritos.includes(eventoId)) {
      this.favoritos.push(eventoId);
    }
  }

  quitarFavorito(eventoId) {
    this.favoritos = this.favoritos.filter((id) => id !== eventoId);
  }

  esFavorito(eventoId) {
    return this.favoritos.includes(eventoId);
  }

  toPublicJSON() {
    return {
      id: this.id,
      nombre: this.nombre,
      apellido: this.apellido,
      email: this.email,
      rol: this.rol,
      favoritos: [...this.favoritos],
      fechaCreacion: this.fechaCreacion,
    };
  }
}
