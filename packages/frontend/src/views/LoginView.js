import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Ticket, Mail, Lock, AlertCircle, ArrowRight, Sparkles, UserCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function LoginView() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.message || "Error al iniciar sesión. Revisa tus credenciales.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLogin = (quickEmail, quickPassword) => {
    setEmail(quickEmail);
    setPassword(quickPassword);
    setError("");
  };

  return (
    <div className="view-container">
      {/* Header con marca */}
      <div className="brand-header">
        <div className="brand-icon-wrapper">
          <Ticket size={32} className="brand-icon" />
        </div>
        <h1 className="brand-title">AI Ticket It</h1>
        <p className="brand-subtitle">Tu portal de entradas y eventos inteligentes</p>
      </div>

      {/* Formulario de Login */}
      <div className="card-glass auth-card">
        <h2 className="card-title">Iniciar Sesión</h2>

        {error && (
          <div className="alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label htmlFor="email">Correo Electrónico</label>
            <div className="input-field-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                id="email"
                type="email"
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="password">Contraseña</label>
            <div className="input-field-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                id="password"
                type="password"
                placeholder="Tu contraseña secreta"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? "Verificando..." : "Entrar a la plataforma"}
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="auth-footer-link">
          <span>¿No tienes una cuenta aún?</span>
          <Link to="/register" className="link-highlight">
            Crear cuenta gratis
          </Link>
        </div>
      </div>

      {/* Accesos rápidos para evaluación docente / demo */}
      <div className="quick-access-section">
        <div className="quick-access-header">
          <Sparkles size={16} className="text-amber" />
          <span>Credenciales rápidas de prueba</span>
        </div>
        <div className="quick-access-buttons">
          <button
            type="button"
            className="btn-quick-login"
            onClick={() => handleQuickLogin("comprador@demo.com", "comprador123")}
          >
            <UserCheck size={16} />
            <div>
              <strong>Comprador Demo</strong>
              <small>comprador@demo.com</small>
            </div>
          </button>

          <button
            type="button"
            className="btn-quick-login"
            onClick={() => handleQuickLogin("organizador@demo.com", "organizador123")}
          >
            <UserCheck size={16} />
            <div>
              <strong>Organizador Demo</strong>
              <small>organizador@demo.com</small>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
