import request from "supertest";
import express from "express";
import { authMiddleware } from "../../src/middlewares/authMiddleware.js";
import { requireRole } from "../../src/middlewares/requireRole.js";
import { errorHandler } from "../../src/middlewares/errorHandler.js";
import { AuthService } from "../../src/services/AuthService.js";
import { RolUsuario } from "../../src/models/enums.js";

describe("Middleware: authMiddleware y requireRole", () => {
  const authService = new AuthService();
  let testApp;
  let tokenComprador;
  let tokenOrganizador;

  beforeAll(() => {
    tokenComprador = authService.generarToken({
      id: "u-1",
      email: "c@test.com",
      rol: RolUsuario.COMPRADOR,
      nombre: "Carlos",
      apellido: "Comprador",
    });

    tokenOrganizador = authService.generarToken({
      id: "u-2",
      email: "o@test.com",
      rol: RolUsuario.ORGANIZADOR,
      nombre: "Olga",
      apellido: "Organizadora",
    });

    testApp = express();
    testApp.use(express.json());

    // Ruta protegida solo para ORGANIZADOR
    testApp.get(
      "/solo-organizador",
      authMiddleware(authService),
      requireRole(RolUsuario.ORGANIZADOR),
      (req, res) => res.json({ ok: true, usuario: req.user })
    );

    testApp.use(errorHandler);
  });

  test("debería permitir acceso si el token es válido y tiene el rol requerido", async () => {
    const res = await request(testApp)
      .get("/solo-organizador")
      .set("Authorization", `Bearer ${tokenOrganizador}`);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.usuario.rol).toBe(RolUsuario.ORGANIZADOR);
  });

  test("debería responder 403 Forbidden si el rol no coincide", async () => {
    const res = await request(testApp)
      .get("/solo-organizador")
      .set("Authorization", `Bearer ${tokenComprador}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toContain("Acceso denegado");
  });

  test("debería responder 401 si no hay token", async () => {
    const res = await request(testApp).get("/solo-organizador");
    expect(res.status).toBe(401);
  });
});
