import { inMemoryStore } from "./InMemoryStore.js";
import { ConflictError } from "../errors/AppError.js";

export class UsuarioRepository {
  static async guardar(usuario) {
    if (!usuario.id) {
      usuario.id = inMemoryStore.nextId("user");
    }

    const emailNormalizado = usuario.email.toLowerCase().trim();
    const existeConMismoEmail = inMemoryStore.usuarios.some(
      (u) => u.email.toLowerCase().trim() === emailNormalizado && u.id !== usuario.id
    );

    if (existeConMismoEmail) {
      throw new ConflictError(`Ya existe un usuario registrado con el email '${usuario.email}'`);
    }

    const index = inMemoryStore.usuarios.findIndex((u) => u.id === usuario.id);
    if (index >= 0) {
      inMemoryStore.usuarios[index] = usuario;
    } else {
      inMemoryStore.usuarios.push(usuario);
    }

    return usuario;
  }

  static async buscarTodos() {
    return [...inMemoryStore.usuarios];
  }

  static async buscarPorId(id) {
    return inMemoryStore.usuarios.find((u) => u.id === id) || null;
  }

  static async buscarPorEmail(email) {
    if (!email) return null;
    const emailNormalizado = email.toLowerCase().trim();
    return inMemoryStore.usuarios.find((u) => u.email.toLowerCase().trim() === emailNormalizado) || null;
  }

  static async eliminarPorId(id) {
    const index = inMemoryStore.usuarios.findIndex((u) => u.id === id);
    if (index === -1) {
      return false;
    }
    inMemoryStore.usuarios.splice(index, 1);
    return true;
  }

  static async limpiar() {
    inMemoryStore.usuarios = [];
    inMemoryStore.counters.user = 1;
  }
}
