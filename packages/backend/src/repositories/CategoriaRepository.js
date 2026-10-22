import { inMemoryStore } from "./InMemoryStore.js";
import { ConflictError } from "../errors/AppError.js";

export class CategoriaRepository {
  static async guardar(categoria) {
    if (!categoria.id) {
      categoria.id = inMemoryStore.nextId("cat");
    }

    const nombreNormalizado = categoria.nombre.toLowerCase().trim();
    const existeConMismoNombre = inMemoryStore.categorias.some(
      (c) => c.nombre.toLowerCase().trim() === nombreNormalizado && c.id !== categoria.id
    );

    if (existeConMismoNombre) {
      throw new ConflictError(`Ya existe una categoría con el nombre '${categoria.nombre}'`);
    }

    const index = inMemoryStore.categorias.findIndex((c) => c.id === categoria.id);
    if (index >= 0) {
      inMemoryStore.categorias[index] = categoria;
    } else {
      inMemoryStore.categorias.push(categoria);
    }

    return categoria;
  }

  static async buscarTodos() {
    return [...inMemoryStore.categorias];
  }

  static async buscarPorId(id) {
    return inMemoryStore.categorias.find((c) => c.id === id) || null;
  }

  static async buscarPorNombre(nombre) {
    if (!nombre) return null;
    const nombreNormalizado = nombre.toLowerCase().trim();
    return inMemoryStore.categorias.find((c) => c.nombre.toLowerCase().trim() === nombreNormalizado) || null;
  }

  static async eliminarPorId(id) {
    const index = inMemoryStore.categorias.findIndex((c) => c.id === id);
    if (index === -1) {
      return false;
    }
    inMemoryStore.categorias.splice(index, 1);
    return true;
  }

  static async limpiar() {
    inMemoryStore.categorias = [];
    inMemoryStore.counters.cat = 1;
  }
}
