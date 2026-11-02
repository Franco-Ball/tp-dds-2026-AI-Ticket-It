import { api } from "./api";

export const compraService = {
  crearCompra: async ({ eventoId, tipoEntradaId, cantidad }) => {
    return api.post("/compras", { eventoId, tipoEntradaId, cantidad });
  },

  registrarPago: async (compraId, { metodoPago = "TARJETA_SIMULADA" } = {}) => {
    return api.post(`/compras/${compraId}/pagos`, { metodoPago });
  },

  obtenerMisCompras: async () => {
    return api.get("/compras/mis-compras");
  },

  obtenerComprasDeEvento: async (eventoId) => {
    return api.get(`/eventos/${eventoId}/compras`);
  },

  actualizarEstadoCompra: async (compraId, { estado, motivo = "" }) => {
    return api.patch(`/compras/${compraId}/estado`, { estado, motivo });
  },

  obtenerCompraPorId: async (compraId) => {
    return api.get(`/compras/${compraId}`);
  },
};
