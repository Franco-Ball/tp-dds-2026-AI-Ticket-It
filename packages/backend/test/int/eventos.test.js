import request from "supertest";
import app from "../../src/app.js";
import { inMemoryStore } from "../../src/repositories/InMemoryStore.js";
import { cargarSeeds } from "../../src/seeds/seedData.js";

describe("Integración: Catálogo y Eventos API", () => {
  let compradorToken = "";
  let organizadorToken = "";
  let organizadorId = "";
  let categoriaId = "";

  beforeEach(async () => {
    inMemoryStore.reset();
    await cargarSeeds(true);

    // Login Comprador
    const resComprador = await request(app)
      .post("/api/auth/login")
      .send({ email: "comprador@demo.com", password: "comprador123" });
    compradorToken = resComprador.body.token;

    // Login Organizador
    const resOrganizador = await request(app)
      .post("/api/auth/login")
      .send({ email: "organizador@demo.com", password: "organizador123" });
    organizadorToken = resOrganizador.body.token;
    organizadorId = resOrganizador.body.usuario.id;

    // Obtener una categoría
    const resCat = await request(app).get("/api/categorias");
    categoriaId = resCat.body[0].id;
  });

  describe("GET /api/categorias", () => {
    test("debería listar todas las categorías disponibles", async () => {
      const res = await request(app).get("/api/categorias");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty("id");
      expect(res.body[0]).toHaveProperty("nombre");
    });
  });

  describe("GET /api/eventos", () => {
    test("debería listar todos los eventos del catálogo", async () => {
      const res = await request(app).get("/api/eventos");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty("tiposEntrada");
      expect(res.body[0]).toHaveProperty("precioMinimo");
    });

    test("debería filtrar eventos por búsqueda textual (?q=...)", async () => {
      const res = await request(app).get("/api/eventos?q=Coldplay");

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].nombre).toContain("Coldplay");
    });

    test("debería filtrar eventos por categoría (?categoria=...)", async () => {
      const res = await request(app).get(`/api/eventos?categoria=${categoriaId}`);

      expect(res.status).toBe(200);
      res.body.forEach((ev) => {
        expect(ev.categoriaId).toBe(categoriaId);
      });
    });

    test("debería ordenar eventos por precio ascendente (?sortBy=precio&order=asc)", async () => {
      const res = await request(app).get("/api/eventos?sortBy=precio&order=asc");

      expect(res.status).toBe(200);
      for (let i = 1; i < res.body.length; i++) {
        expect(res.body[i].precioMinimo).toBeGreaterThanOrEqual(res.body[i - 1].precioMinimo);
      }
    });

    test("debería ordenar eventos por precio descendente (?sortBy=precio&order=desc)", async () => {
      const res = await request(app).get("/api/eventos?sortBy=precio&order=desc");

      expect(res.status).toBe(200);
      for (let i = 1; i < res.body.length; i++) {
        expect(res.body[i].precioMinimo).toBeLessThanOrEqual(res.body[i - 1].precioMinimo);
      }
    });
  });

  describe("GET /api/eventos/:id", () => {
    test("debería devolver el detalle completo de un evento con organizador", async () => {
      const lista = await request(app).get("/api/eventos");
      const eventoId = lista.body[0].id;

      const res = await request(app).get(`/api/eventos/${eventoId}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(eventoId);
      expect(res.body).toHaveProperty("organizador");
      expect(res.body.organizador).toHaveProperty("nombre");
    });

    test("debería devolver 404 si el evento no existe", async () => {
      const res = await request(app).get("/api/eventos/evento-inexistente");
      expect(res.status).toBe(404);
    });
  });

  describe("POST /api/eventos", () => {
    const nuevoEventoValido = {
      nombre: "Festival de Jazz Primavera",
      descripcion: "Noche de jazz y blues al aire libre",
      fecha: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      multimedia: ["https://example.com/jazz.jpg"],
      tiposEntrada: [
        {
          nombre: "General",
          precio: 10000,
          cupoTotal: 150,
        },
        {
          nombre: "Mesa VIP",
          precio: 25000,
          cupoTotal: 30,
        },
      ],
    };

    test("debería fallar sin token con 401 Unauthorized", async () => {
      const res = await request(app)
        .post("/api/eventos")
        .send({ ...nuevoEventoValido, categoriaId });

      expect(res.status).toBe(401);
    });

    test("debería fallar si un Comprador intenta crear un evento con 403 Forbidden", async () => {
      const res = await request(app)
        .post("/api/eventos")
        .set("Authorization", `Bearer ${compradorToken}`)
        .send({ ...nuevoEventoValido, categoriaId });

      expect(res.status).toBe(403);
    });

    test("debería permitir a un Organizador crear un evento correctamente", async () => {
      const res = await request(app)
        .post("/api/eventos")
        .set("Authorization", `Bearer ${organizadorToken}`)
        .send({ ...nuevoEventoValido, categoriaId });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body.nombre).toBe("Festival de Jazz Primavera");
      expect(res.body.tiposEntrada.length).toBe(2);
      expect(res.body.organizadorId).toBe(organizadorId);
    });

    test("debería fallar si la fecha del evento es pasada", async () => {
      const res = await request(app)
        .post("/api/eventos")
        .set("Authorization", `Bearer ${organizadorToken}`)
        .send({
          ...nuevoEventoValido,
          categoriaId,
          fecha: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        });

      expect(res.status).toBe(422);
    });
  });

  describe("GET /api/organizadores/:id/eventos", () => {
    test("debería listar los eventos creados por un organizador", async () => {
      const res = await request(app).get(`/api/organizadores/${organizadorId}/eventos`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      res.body.forEach((ev) => {
        expect(ev.organizadorId).toBe(organizadorId);
      });
    });
  });
});
