import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="mobile-loading-container">
        <div className="mobile-spinner"></div>
        <p>Cargando sesión...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.rol)) {
    return (
      <div className="mobile-restricted-container">
        <h3>Acceso Restringido</h3>
        <p>
          Esta sección requiere permisos de rol: <strong>{allowedRoles.join(" o ")}</strong>.
        </p>
        <p>
          Tu rol actual es: <strong>{user?.rol}</strong>.
        </p>
      </div>
    );
  }

  return children;
}
