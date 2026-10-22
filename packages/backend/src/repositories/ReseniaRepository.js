import { inMemoryStore } from "./InMemoryStore.js";

export class ReseniaRepository {
  static async guardar(resenia) {
    if (!resenia.id) {
      resenia.id = inMemoryStore.nextId("rev");
    }

    const index = inMemoryStore.resenias.findIndex((r) => r.id === resenia.id);
    if (index >= 0) {
      inMemoryStore.resenias[index] = resenia;
    } else {
      inMemoryStore.resenias.push(resenia);
    }

    return resenia;
  }

  static async buscarPorId(id) {
    return inMemoryStore.resenias.find((r) => r.id === id) || null;
  }

  static async buscarPorEvento(eventoId) {
    return inMemoryStore.resenias
      .filter((r) => r.eventoId === eventoId)
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }

  static async buscarPorOrganizador(organizadorId) {
    return inMemoryStore.resenias
      .filter((r) => r.organizadorId === organizadorId)
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }

  static async buscarPorCompradorYEvento(compradorId, eventoId) {
    return (
      inMemoryStore.resenias.find(
        (r) => r.compradorId === compradorId && r.eventoId === eventoId
      ) || null
    );
  }

  static async calcularReputacionOrganizador(organizadorId) {
    const resenias = inMemoryStore.resenias.filter(
      (r) => r.organizadorId === organizadorId
    );

    if (resenias.length === 0) {
      return {
        reputacion: null,
        totalResenias: 0,
      };
    }

    const suma = resenias.reduce((acc, r) => acc + r.puntuacion, 0);
    const promedio = Math.round((suma / resenias.length) * 10) / 10;

    return {
      reputacion: promedio,
      totalResenias: resenias.length,
    };
  }

  static async buscarTodos() {
    return [...inMemoryStore.resenias];
  }

  static async eliminarPorId(id) {
    const index = inMemoryStore.resenias.findIndex((r) => r.id === id);
    if (index === -1) {
      return false;
    }
    inMemoryStore.resenias.splice(index, 1);
    return true;
  }

  static async limpiar() {
    inMemoryStore.resenias = [];
    inMemoryStore.counters.rev = 1;
  }
}
