import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authService } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Validar y cargar sesión persistida al iniciar la app
  useEffect(() => {
    async function cargarSesion() {
      try {
        const storedToken = await AsyncStorage.getItem("token");
        const storedUser = await AsyncStorage.getItem("user");

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));

          // Verificación en segundo plano contra el backend
          authService
            .getMe()
            .then((usuarioActualizado) => {
              setUser(usuarioActualizado);
              AsyncStorage.setItem("user", JSON.stringify(usuarioActualizado));
            })
            .catch(() => {
              // Si el token expiró en el servidor
              logout();
            });
        }
      } catch (error) {
        console.warn("Error cargando sesión persistente:", error.message);
      } finally {
        setLoading(false);
      }
    }

    cargarSesion();
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authService.login(email, password);
    setToken(res.token);
    setUser(res.usuario);
    await AsyncStorage.setItem("token", res.token);
    await AsyncStorage.setItem("user", JSON.stringify(res.usuario));
    return res.usuario;
  }, []);

  const register = useCallback(async (datos) => {
    const res = await authService.register(datos);
    setToken(res.token);
    setUser(res.usuario);
    await AsyncStorage.setItem("token", res.token);
    await AsyncStorage.setItem("user", JSON.stringify(res.usuario));
    return res.usuario;
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
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
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}
