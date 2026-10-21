import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import MobileLayout from "./components/MobileLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginView from "./views/LoginView";
import RegisterView from "./views/RegisterView";
import HomeView from "./views/HomeView";
import ProfileView from "./views/ProfileView";
import { Sparkles } from "lucide-react";
import "./App.css";

function PlaceholderView({ title, sprint, description }) {
  return (
    <div className="view-container">
      <div className="card-glass placeholder-card">
        <div className="placeholder-icon-circle">
          <Sparkles size={28} className="text-purple" />
        </div>
        <h2 className="placeholder-title">{title}</h2>
        <span className="badge-sprint">{sprint}</span>
        <p className="placeholder-desc">
          {description ||
            `Esta funcionalidad está planificada en el ${sprint} del plan de entregas del trabajo práctico.`}
        </p>
        <Link to="/" className="btn btn-primary">
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <MobileLayout>
          <Routes>
            {/* Rutas Públicas de Auth */}
            <Route path="/login" element={<LoginView />} />
            <Route path="/register" element={<RegisterView />} />

            {/* Rutas Protegidas */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <HomeView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/perfil"
              element={
                <ProtectedRoute>
                  <ProfileView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/crear-evento"
              element={
                <ProtectedRoute allowedRoles={["ORGANIZADOR"]}>
                  <PlaceholderView
                    title="Publicación de Eventos"
                    sprint="Sprint 2"
                    description="Permitirá definir títulos, categorías, fechas y múltiples tipos de entrada con cupos y precios."
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mis-compras"
              element={
                <ProtectedRoute allowedRoles={["COMPRADOR"]}>
                  <PlaceholderView
                    title="Seguimiento de Compras"
                    sprint="Sprint 3"
                    description="Permitirá visualizar entradas adquiridas, estados de compra, cálculo de días faltantes y reembolsos."
                  />
                </ProtectedRoute>
              }
            />

            {/* Redirección por defecto */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MobileLayout>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
