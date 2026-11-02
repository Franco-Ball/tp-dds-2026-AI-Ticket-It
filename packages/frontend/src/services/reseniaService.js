import { api } from "./api";

export const reseniaService = {
  crearResenia: async (eventoId, { puntuacion, detalle }) => {
    return api.post(`/eventos/${eventoId}/resenias`, { puntuacion, detalle });
  },

  listarPorEvento: async (eventoId) => {
    return api.get(`/eventos/${eventoId}/resenias`);
  },

  listarPorOrganizador: async (organizadorId) => {
    return api.get(`/organizadores/${organizadorId}/resenias`);
  },
};
