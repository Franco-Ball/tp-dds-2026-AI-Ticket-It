import { inMemoryStore } from "./InMemoryStore.js";

export class CompraRepository {
  static async guardar(compra) {
    if (!compra.id) {
      compra.id = inMemoryStore.nextId("comp");
      // Actualizar compraId en el historial
      compra.historialEstados.forEach((h) => {
        if (!h.compraId || h.compraId === "compra-tmp") {
          h.compraId = compra.id;
        }
      });
    }

    const index = inMemoryStore.compras.findIndex((c) => c.id === compra.id);
    if (index >= 0) {
      inMemoryStore.compras[index] = compra;
    } else {
      inMemoryStore.compras.push(compra);
    }

    return compra;
  }

  static async buscarPorId(id) {
    return inMemoryStore.compras.find((c) => c.id === id) || null;
  }

  static async buscarPorComprador(compradorId) {
    return inMemoryStore.compras
      .filter((c) => c.compradorId === compradorId)
      .sort((a, b) => new Date(b.fechaCompra).getTime() - new Date(a.fechaCompra).getTime());
  }

  static async buscarPorEvento(eventoId) {
    return inMemoryStore.compras
      .filter((c) => c.eventoId === eventoId)
      .sort((a, b) => new Date(b.fechaCompra).getTime() - new Date(a.fechaCompra).getTime());
  }

  static async buscarTodos() {
    return [...inMemoryStore.compras];
  }

  static async eliminarPorId(id) {
    const index = inMemoryStore.compras.findIndex((c) => c.id === id);
    if (index === -1) {
      return false;
    }
    inMemoryStore.compras.splice(index, 1);
    return true;
  }

  static async limpiar() {
    inMemoryStore.compras = [];
    inMemoryStore.counters.comp = 1;
  }
}
