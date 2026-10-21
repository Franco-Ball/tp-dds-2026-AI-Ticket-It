import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Mail, Shield, Calendar, LogOut, Key, Check } from "lucide-react";

export default function ProfileView() {
  const { user, isOrganizador, logout } = useAuth();
  const navigate = useNavigate();
  const [copiedToken, setCopiedToken] = useState(false);

  const handleLogout = () => {
    if (window.confirm("¿Estás seguro de que deseas cerrar tu sesión?")) {
      logout();
      navigate("/login");
    }
  };

  const initials = `${user?.nombre?.[0] || ""}${user?.apellido?.[0] || ""}`.toUpperCase();

  const handleCopyUserId = () => {
    if (user?.id) {
      navigator.clipboard?.writeText(user.id);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  return (
    <div className="view-container">
      <div className="profile-header">
        <div className="profile-avatar">
          <span>{initials || "U"}</span>
        </div>
        <h1 className="profile-title">
          {user?.nombre} {user?.apellido}
        </h1>
        <span className={`badge-role ${isOrganizador ? "badge-organizador" : "badge-comprador"}`}>
          {isOrganizador ? "Organizador de Eventos" : "Comprador de Entradas"}
        </span>
      </div>

      <div className="card-glass profile-details-card">
        <h3 className="section-title-sm">Datos de la Cuenta</h3>

        <div className="profile-info-list">
          <div className="profile-info-item">
            <div className="info-icon bg-blue-light">
              <Mail size={18} className="text-blue" />
            </div>
            <div className="info-content">
              <span className="info-label">Correo Electrónico</span>
              <strong className="info-value">{user?.email}</strong>
            </div>
          </div>

          <div className="profile-info-item">
            <div className="info-icon bg-purple-light">
              <Shield size={18} className="text-purple" />
            </div>
            <div className="info-content">
              <span className="info-label">Rol del Usuario</span>
              <strong className="info-value">{user?.rol}</strong>
            </div>
          </div>

          <div className="profile-info-item" onClick={handleCopyUserId} style={{ cursor: "pointer" }}>
            <div className="info-icon bg-amber-light">
              <Key size={18} className="text-amber" />
            </div>
            <div className="info-content">
              <span className="info-label">ID de Usuario (toca para copiar)</span>
              <strong className="info-value text-xs">{user?.id}</strong>
            </div>
            {copiedToken && <Check size={16} className="text-green" />}
          </div>

          <div className="profile-info-item">
            <div className="info-icon bg-green-light">
              <Calendar size={18} className="text-green" />
            </div>
            <div className="info-content">
              <span className="info-label">Miembro Desde</span>
              <strong className="info-value">
                {user?.fechaCreacion ? new Date(user.fechaCreacion).toLocaleDateString() : "Hoy"}
              </strong>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-actions-wrapper">
        <button type="button" className="btn btn-outline-danger btn-block" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
}
