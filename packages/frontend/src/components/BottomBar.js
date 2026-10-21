import React from "react";
import { NavLink } from "react-router-dom";
import { Compass, ShoppingBag, User, Calendar, PlusCircle, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function BottomBar() {
  const { isAuthenticated, isOrganizador } = useAuth();

  if (!isAuthenticated) {
    return (
      <nav className="mobile-bottom-nav">
        <NavLink
          to="/login"
          className={({ isActive }) => `bottom-nav-item ${isActive ? "active" : ""}`}
        >
          <LogIn size={20} />
          <span>Ingresar</span>
        </NavLink>
        <NavLink
          to="/register"
          className={({ isActive }) => `bottom-nav-item ${isActive ? "active" : ""}`}
        >
          <UserPlus size={20} />
          <span>Registro</span>
        </NavLink>
      </nav>
    );
  }

  if (isOrganizador) {
    return (
      <nav className="mobile-bottom-nav">
        <NavLink
          to="/"
          end
          className={({ isActive }) => `bottom-nav-item ${isActive ? "active" : ""}`}
        >
          <Calendar size={20} />
          <span>Mis Eventos</span>
        </NavLink>
        <NavLink
          to="/crear-evento"
          className={({ isActive }) => `bottom-nav-item ${isActive ? "active" : ""}`}
        >
          <PlusCircle size={20} />
          <span>Publicar</span>
        </NavLink>
        <NavLink
          to="/perfil"
          className={({ isActive }) => `bottom-nav-item ${isActive ? "active" : ""}`}
        >
          <User size={20} />
          <span>Perfil</span>
        </NavLink>
      </nav>
    );
  }

  // Por defecto: COMPRADOR
  return (
    <nav className="mobile-bottom-nav">
      <NavLink
        to="/"
        end
        className={({ isActive }) => `bottom-nav-item ${isActive ? "active" : ""}`}
      >
        <Compass size={20} />
        <span>Explorar</span>
      </NavLink>
      <NavLink
        to="/mis-compras"
        className={({ isActive }) => `bottom-nav-item ${isActive ? "active" : ""}`}
      >
        <ShoppingBag size={20} />
        <span>Mis Compras</span>
      </NavLink>
      <NavLink
        to="/perfil"
        className={({ isActive }) => `bottom-nav-item ${isActive ? "active" : ""}`}
      >
        <User size={20} />
        <span>Perfil</span>
      </NavLink>
    </nav>
  );
}
