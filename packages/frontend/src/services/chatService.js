import { api } from "./api";

export const chatService = {
  obtenerHistorial: async (compraId) => {
    return api.get(`/compras/${compraId}/mensajes`);
  },

  enviarMensaje: async (compraId, mensaje) => {
    return api.post(`/compras/${compraId}/mensajes`, { mensaje });
  },
};

