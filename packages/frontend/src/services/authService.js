import { api } from "./api";

export const authService = {
  login: async (email, password) => {
    return api.post("/auth/login", { email, password });
  },

  register: async ({ nombre, apellido, email, password, rol }) => {
    return api.post("/auth/register", { nombre, apellido, email, password, rol });
  },

  getMe: async () => {
    return api.get("/auth/me");
  },
};
