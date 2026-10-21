import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  CheckCircle2,
  Calendar,
  Ticket,
  PlusCircle,
  ShoppingBag,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

export default function HomeView() {
  const { user, isOrganizador } = useAuth();

  return (
    <div className="view-container">
      {/* Header de bienvenida */}
      <div className="home-hero-card">
        <div className="hero-top-row">
          <div>
            <span className="hero-greeting">¡Bienvenido de nuevo!</span>
            <h1 className="hero-name">
              {user?.nombre} {user?.apellido}
            </h1>
          </div>
          <span className={`badge-role ${isOrganizador ? "badge-organizador" : "badge-comprador"}`}>
            {isOrganizador ? "Organizador" : "Comprador"}
          </span>
        </div>
        <p className="hero-description">
          {isOrganizador
            ? "Gestiona tus eventos, controla cupos en tiempo real y supervisa tus ventas."
            : "Descubre espectáculos, adquiere entradas de forma segura y gestiona tus reservas."}
        </p>
      </div>

      {/* Tarjeta de estado arquitectónico del Sprint 1 */}
      <div className="card-glass status-card">
        <div className="status-header">
          <div className="status-badge-live">
            <span className="pulse-dot"></span>
            <span>Sprint 1 Completado</span>
          </div>
          <span className="text-muted text-xs">Infraestructura Base</span>
        </div>

        <h3 className="section-title-sm">Servicios Activos</h3>
        <ul className="status-checklist">
          <li>
            <CheckCircle2 size={18} className="text-green" />
            <div>
              <strong>Autenticación y Sesión JWT</strong>
              <small>Tokens con firma criptográfica y expiración configurable</small>
            </div>
          </li>
          <li>
            <CheckCircle2 size={18} className="text-green" />
            <div>
              <strong>Persistencia InMemoryStore</strong>
              <small>Colecciones en memoria estructuradas y datos semilla</small>
            </div>
          </li>
          <li>
            <CheckCircle2 size={18} className="text-green" />
            <div>
              <strong>Control de Acceso por Roles</strong>
              <small>Rutas diferenciadas para Compradores y Organizadores</small>
            </div>
          </li>
        </ul>
      </div>

      {/* Acciones principales de flujo de trabajo */}
      <div className="actions-section">
        <h3 className="section-title-md">Acciones Rápidas</h3>

        <div className="action-cards-grid">
          {isOrganizador ? (
            <>
              <div className="action-card">
                <div className="action-card-icon bg-amber-light">
                  <PlusCircle size={24} className="text-amber" />
                </div>
                <div className="action-card-content">
                  <h4>Publicar Evento</h4>
                  <p>Habilitado en el Sprint 2: define fechas, categorías y entradas.</p>
                </div>
              </div>

              <div className="action-card">
                <div className="action-card-icon bg-purple-light">
                  <Calendar size={24} className="text-purple" />
                </div>
                <div className="action-card-content">
                  <h4>Panel de Eventos</h4>
                  <p>Visualiza el cupo restante y compras asociadas por evento.</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="action-card">
                <div className="action-card-icon bg-blue-light">
                  <Ticket size={24} className="text-blue" />
                </div>
                <div className="action-card-content">
                  <h4>Explorar Catálogo</h4>
                  <p>Habilitado en el Sprint 2: búsqueda textual y filtros por categoría.</p>
                </div>
              </div>

              <div className="action-card">
                <div className="action-card-icon bg-green-light">
                  <ShoppingBag size={24} className="text-green" />
                </div>
                <div className="action-card-content">
                  <h4>Mis Entradas</h4>
                  <p>Seguimiento de compras, días faltantes y reembolsos (Sprint 3).</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Acceso a perfil */}
      <div className="profile-banner-link">
        <Link to="/perfil" className="profile-link-card">
          <div className="profile-link-content">
            <ShieldCheck size={20} className="text-purple" />
            <span>Gestionar mi cuenta y seguridad</span>
          </div>
          <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}
