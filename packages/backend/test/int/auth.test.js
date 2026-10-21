import request from "supertest";
import app from "../../src/app.js";
import { inMemoryStore } from "../../src/repositories/InMemoryStore.js";
import { cargarSeeds } from "../../src/seeds/seedData.js";
import { RolUsuario } from "../../src/models/enums.js";

describe("Integración: Autenticación y Autorización API", () => {
  beforeEach(async () => {
    inMemoryStore.reset();
    await cargarSeeds(true);
  });

  describe("Usuarios Semilla", () => {
    test("debería permitir iniciar sesión con usuario Comprador demo", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "comprador@demo.com",
          password: "comprador123",
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token");
      expect(res.body.usuario.email).toBe("comprador@demo.com");
      expect(res.body.usuario.rol).toBe(RolUsuario.COMPRADOR);
    });

    test("debería permitir iniciar sesión con usuario Organizador demo", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "organizador@demo.com",
          password: "organizador123",
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token");
      expect(res.body.usuario.email).toBe("organizador@demo.com");
      expect(res.body.usuario.rol).toBe(RolUsuario.ORGANIZADOR);
    });
  });

  describe("POST /api/auth/register", () => {
    test("debería registrar un nuevo comprador correctamente", async () => {
      const nuevoUsuario = {
        nombre: "Martín",
        apellido: "Ríos",
        email: "martin.rios@email.com",
        password: "password123",
        rol: RolUsuario.COMPRADOR,
      };

      const res = await request(app)
        .post("/api/auth/register")
        .send(nuevoUsuario);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("token");
      expect(res.body.usuario).toMatchObject({
        nombre: "Martín",
        apellido: "Ríos",
        email: "martin.rios@email.com",
        rol: RolUsuario.COMPRADOR,
      });
      expect(res.body.usuario.passwordHash).toBeUndefined();
    });

    test("debería rechazar registro con email ya existente (409)", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          nombre: "Duplicado",
          apellido: "Prueba",
          email: "comprador@demo.com",
          password: "password123",
          rol: RolUsuario.COMPRADOR,
        });

      expect(res.status).toBe(409);
      expect(res.body.message).toContain("Ya existe un usuario");
    });

    test("debería responder 422 si la contraseña es menor a 6 caracteres", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          nombre: "Corto",
          apellido: "Pass",
          email: "corto@test.com",
          password: "123",
          rol: RolUsuario.COMPRADOR,
        });

      expect(res.status).toBe(422);
      expect(res.body.message).toContain("password");
    });
  });

  describe("POST /api/auth/login", () => {
    test("debería rechazar credenciales con contraseña incorrecta (401)", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "comprador@demo.com",
          password: "clave-erronea",
        });

      expect(res.status).toBe(401);
      expect(res.body.message).toContain("Credenciales inválidas");
    });

    test("debería rechazar login de usuario no existente (401)", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "inexistente@demo.com",
          password: "password123",
        });

      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/auth/me", () => {
    test("debería devolver el perfil del usuario autenticado con token válido", async () => {
      const loginRes = await request(app)
        .post("/api/auth/login")
        .send({
          email: "comprador@demo.com",
          password: "comprador123",
        });

      const token = loginRes.body.token;

      const meRes = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`);

      expect(meRes.status).toBe(200);
      expect(meRes.body.email).toBe("comprador@demo.com");
      expect(meRes.body.rol).toBe(RolUsuario.COMPRADOR);
    });

    test("debería rechazar petición sin encabezado Authorization (401)", async () => {
      const res = await request(app).get("/api/auth/me");
      expect(res.status).toBe(401);
    });

    test("debería rechazar petición con token inválido o corrupto (401)", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer token_falso_invalido");

      expect(res.status).toBe(401);
    });
  });
});
