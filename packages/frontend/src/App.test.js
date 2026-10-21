import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";

test("renderiza la pantalla de inicio de sesión de AI Ticket It por defecto", () => {
  render(<App />);
  const titleElements = screen.getAllByText(/AI Ticket It/i);
  expect(titleElements.length).toBeGreaterThan(0);
  expect(screen.getByRole("heading", { name: /Iniciar Sesión/i })).toBeInTheDocument();
  expect(screen.getByText(/Credenciales rápidas de prueba/i)).toBeInTheDocument();
});
