import { api } from "./api";

export const categoriaService = {
  listarCategorias: async () => {
    return api.get("/categorias");
  },
  obtenerCategoriaPorId: async (id) => {
    return api.get(`/categorias/${id}`);
  },
};
