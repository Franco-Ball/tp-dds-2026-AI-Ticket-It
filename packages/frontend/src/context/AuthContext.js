import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  // Validar el token existente contra el backend al montar
  useEffect(() => {
    async function verificarSesion() {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        try {
          const usuarioActualizado = await authService.getMe();
          setUser(usuarioActualizado);
          localStorage.setItem("user", JSON.stringify(usuarioActualizado));
        } catch (error) {
          console.warn("Sesión expirada o token inválido:", error.message);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    }

    verificarSesion();
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authService.login(email, password);
    setToken(res.token);
    setUser(res.usuario);
    localStorage.setItem("token", res.token);
    localStorage.setItem("user", JSON.stringify(res.usuario));
    return res.usuario;
  }, []);

  const register = useCallback(async (datos) => {
    const res = await authService.register(datos);
    setToken(res.token);
    setUser(res.usuario);
    localStorage.setItem("token", res.token);
    localStorage.setItem("user", JSON.stringify(res.usuario));
    return res.usuario;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    isComprador: user?.rol === "COMPRADOR",
    isOrganizador: user?.rol === "ORGANIZADOR",
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe utilizarse dentro de un AuthProvider");
  }
  return context;
}
