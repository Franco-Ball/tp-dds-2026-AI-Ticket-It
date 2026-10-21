import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Ticket, Mail, Lock, User, AlertCircle, ArrowRight, ShoppingCart, Calendar } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { ROL_USUARIO } from "../config/constants";

export default function RegisterView() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState(ROL_USUARIO.COMPRADOR);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("La contraseña debe tener un mínimo de 6 caracteres.");
      return;
    }

    setSubmitting(true);
    try {
      await register({ nombre, apellido, email, password, rol });
      navigate("/");
    } catch (err) {
      setError(err.message || "Error al registrarse. Por favor intenta nuevamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="view-container">
      <div className="brand-header">
        <div className="brand-icon-wrapper">
          <Ticket size={32} className="brand-icon" />
        </div>
        <h1 className="brand-title">Crear Cuenta</h1>
        <p className="brand-subtitle">Únete a la plataforma líder de eventos</p>
      </div>

      <div className="card-glass auth-card">
        {error && (
          <div className="alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Selector de Rol interactivo */}
          <div className="role-selector-group">
            <label className="section-label">Selecciona tu perfil de usuario:</label>
            <div className="role-options-grid">
              <button
                type="button"
                className={`role-option-card ${rol === ROL_USUARIO.COMPRADOR ? "selected" : ""}`}
                onClick={() => setRol(ROL_USUARIO.COMPRADOR)}
              >
                <div className="role-icon-circle">
                  <ShoppingCart size={20} />
                </div>
                <div className="role-card-text">
                  <strong>Comprador</strong>
                  <small>Asistir a eventos</small>
                </div>
              </button>

              <button
                type="button"
                className={`role-option-card ${rol === ROL_USUARIO.ORGANIZADOR ? "selected" : ""}`}
                onClick={() => setRol(ROL_USUARIO.ORGANIZADOR)}
              >
                <div className="role-icon-circle">
                  <Calendar size={20} />
                </div>
                <div className="role-card-text">
                  <strong>Organizador</strong>
                  <small>Publicar eventos</small>
                </div>
              </button>
            </div>
          </div>

          <div className="form-row">
            <div className="input-group">
              <label htmlFor="nombre">Nombre</label>
              <div className="input-field-wrapper">
                <User size={18} className="input-icon" />
                <input
                  id="nombre"
                  type="text"
                  placeholder="Carlos"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="apellido">Apellido</label>
              <div className="input-field-wrapper">
                <User size={18} className="input-icon" />
                <input
                  id="apellido"
                  type="text"
                  placeholder="Gómez"
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="reg-email">Correo Electrónico</label>
            <div className="input-field-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                id="reg-email"
                type="email"
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="reg-password">Contraseña (mínimo 6 caracteres)</label>
            <div className="input-field-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                id="reg-password"
                type="password"
                placeholder="Crea tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? "Creando perfil..." : "Completar Registro"}
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="auth-footer-link">
          <span>¿Ya tienes una cuenta creada?</span>
          <Link to="/login" className="link-highlight">
            Iniciar sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
