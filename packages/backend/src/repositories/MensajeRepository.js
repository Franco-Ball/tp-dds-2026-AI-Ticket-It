import { inMemoryStore } from "./InMemoryStore.js";

export class MensajeRepository {
  static async guardar(mensaje) {
    if (!mensaje.id) {
      mensaje.id = inMemoryStore.nextId("msg");
    }

    const index = inMemoryStore.mensajes.findIndex((m) => m.id === mensaje.id);
    if (index >= 0) {
      inMemoryStore.mensajes[index] = mensaje;
    } else {
      inMemoryStore.mensajes.push(mensaje);
    }

    return mensaje;
  }

  static async buscarPorCompra(compraId) {
    return inMemoryStore.mensajes
      .filter((m) => m.compraId === compraId)
      .sort((a, b) => new Date(a.fechaEnvio).getTime() - new Date(b.fechaEnvio).getTime());
  }

  static async buscarPorId(id) {
    return inMemoryStore.mensajes.find((m) => m.id === id) || null;
  }

  static async buscarTodos() {
    return [...inMemoryStore.mensajes];
  }

  static async eliminarPorId(id) {
    const index = inMemoryStore.mensajes.findIndex((m) => m.id === id);
    if (index === -1) {
      return false;
    }
    inMemoryStore.mensajes.splice(index, 1);
    return true;
  }

  static async limpiar() {
    inMemoryStore.mensajes = [];
    inMemoryStore.counters.msg = 1;
  }
}
