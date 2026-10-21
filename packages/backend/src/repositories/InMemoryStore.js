export class InMemoryStore {
  constructor() {
    this.reset();
  }

  reset() {
    this.usuarios = [];
    this.eventos = [];
    this.categorias = [];
    this.compras = [];
    this.mensajes = [];
    this.resenias = [];

    this.counters = {
      user: 1,
      event: 1,
      cat: 1,
      comp: 1,
      msg: 1,
      rev: 1,
    };

    this.isInitialized = false;
  }

  nextId(prefix = "id") {
    if (!this.counters[prefix]) {
      this.counters[prefix] = 1;
    }
    return `${prefix}-${this.counters[prefix]++}`;
  }
}

export const inMemoryStore = new InMemoryStore();
