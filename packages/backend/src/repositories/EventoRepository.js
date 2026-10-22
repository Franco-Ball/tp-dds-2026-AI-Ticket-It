import { inMemoryStore } from "./InMemoryStore.js";

export class EventoRepository {
  static async guardar(evento) {
    if (!evento.id) {
      evento.id = inMemoryStore.nextId("event");
    }

    // Asegurar IDs únicos en los tipos de entrada si no tienen
    evento.tiposEntrada.forEach((t, index) => {
      if (!t.id) {
        t.id = `${evento.id}-tipo-${index + 1}`;
      }
    });

    const index = inMemoryStore.eventos.findIndex((e) => e.id === evento.id);
    if (index >= 0) {
      inMemoryStore.eventos[index] = evento;
    } else {
      inMemoryStore.eventos.push(evento);
    }

    return evento;
  }

  static async buscarPorId(id) {
    return inMemoryStore.eventos.find((e) => e.id === id) || null;
  }

  static async buscarPorOrganizador(organizadorId) {
    return inMemoryStore.eventos.filter((e) => e.organizadorId === organizadorId);
  }

  static async buscarTodos({
    q = null,
    categoriaId = null,
    minPrecio = null,
    maxPrecio = null,
    organizadorId = null,
    sortBy = "fecha",
    order = "asc",
  } = {}) {
    let resultados = [...inMemoryStore.eventos];

    // Filtro por texto en nombre o descripcion (CU-03)
    if (q && typeof q === "string" && q.trim()) {
      const queryNormalizada = q.toLowerCase().trim();
      resultados = resultados.filter(
        (e) =>
          e.nombre.toLowerCase().includes(queryNormalizada) ||
          e.descripcion.toLowerCase().includes(queryNormalizada)
      );
    }

    // Filtro por categoría (CU-03)
    if (categoriaId && typeof categoriaId === "string" && categoriaId.trim()) {
      resultados = resultados.filter((e) => e.categoriaId === categoriaId.trim());
    }

    // Filtro por organizador
    if (organizadorId && typeof organizadorId === "string" && organizadorId.trim()) {
      resultados = resultados.filter((e) => e.organizadorId === organizadorId.trim());
    }

    // Filtro por rango de precio
    if (minPrecio !== null || maxPrecio !== null) {
      resultados = resultados.filter((e) => e.tuPrecioEstaEntre(minPrecio, maxPrecio));
    }

    // Ordenamiento (CU-11): precio, fecha, puntaje
    const multiplicador = order && order.toLowerCase() === "desc" ? -1 : 1;

    resultados.sort((a, b) => {
      if (sortBy === "precio") {
        return (a.precioMinimo() - b.precioMinimo()) * multiplicador;
      }
      if (sortBy === "puntaje") {
        return (a.puntajePromedio - b.puntajePromedio) * multiplicador;
      }
      // Por defecto ordenar por fecha
      const fechaA = new Date(a.fecha).getTime();
      const fechaB = new Date(b.fecha).getTime();
      return (fechaA - fechaB) * multiplicador;
    });

    return resultados;
  }

  static async eliminarPorId(id) {
    const index = inMemoryStore.eventos.findIndex((e) => e.id === id);
    if (index === -1) {
      return false;
    }
    inMemoryStore.eventos.splice(index, 1);
    return true;
  }

  static async limpiar() {
    inMemoryStore.eventos = [];
    inMemoryStore.counters.event = 1;
  }
}
