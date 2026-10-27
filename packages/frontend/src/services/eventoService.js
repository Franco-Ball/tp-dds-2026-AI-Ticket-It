import { api } from "./api";

export const eventoService = {
  listarEventos: async (filtros = {}) => {
    const params = new URLSearchParams();

    if (filtros.q && filtros.q.trim()) {
      params.append("q", filtros.q.trim());
    }
    if (filtros.categoria && filtros.categoria !== "TODAS") {
      params.append("categoria", filtros.categoria);
    }
    if (filtros.minPrecio != null && filtros.minPrecio !== "") {
      params.append("minPrecio", String(filtros.minPrecio));
    }
    if (filtros.maxPrecio != null && filtros.maxPrecio !== "") {
      params.append("maxPrecio", String(filtros.maxPrecio));
    }
    if (filtros.organizadorId) {
      params.append("organizadorId", filtros.organizadorId);
    }
    if (filtros.sortBy) {
      params.append("sortBy", filtros.sortBy);
    }
    if (filtros.order) {
      params.append("order", filtros.order);
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/eventos?${queryString}` : "/eventos";
    return api.get(endpoint);
  },

  obtenerEventoPorId: async (id) => {
    return api.get(`/eventos/${id}`);
  },

  listarEventosPorOrganizador: async (organizadorId) => {
    return api.get(`/organizadores/${organizadorId}/eventos`);
  },

  crearEvento: async (datosEvento) => {
    return api.post("/eventos", datosEvento);
  },
};
