import request from "supertest";
import app from "../../src/app.js";
import { inMemoryStore } from "../../src/repositories/InMemoryStore.js";
import { cargarSeeds } from "../../src/seeds/seedData.js";
import { EstadoCompra } from "../../src/models/enums.js";
import { CompraRepository } from "../../src/repositories/CompraRepository.js";
import { Compra } from "../../src/models/Compra.js";

describe("Integración: Reseñas y Reputación API (CU-09, CU-10, CU-11)", () => {
  let compradorToken = "";
  let organizadorToken = "";
  let otroCompradorToken = "";
  let organizadorId = "";
  let eventoId = "";
  let tipoEntradaId = "";

  beforeEach(async () => {
    inMemoryStore.reset();
    await cargarSeeds(true);

    // Login Comprador Demo
    const resComprador = await request(app)
      .post("/api/auth/login")
      .send({ email: "comprador@demo.com", password: "comprador123" });
    compradorToken = resComprador.body.token;

    // Login Organizador Demo
    const resOrganizador = await request(app)
      .post("/api/auth/login")
      .send({ email: "organizador@demo.com", password: "organizador123" });
    organizadorToken = resOrganizador.body.token;
    organizadorId = resOrganizador.body.usuario.id;

    // Registrar y loguear a un segundo comprador
    const resOtro = await request(app)
      .post("/api/auth/register")
      .send({
        nombre: "Mariana",
        apellido: "Méndez",
        email: "mariana.mendez@test.com",
        password: "password123",
      });
    otroCompradorToken = resOtro.body.token;

    // Obtener un evento del catálogo
    const resEventos = await request(app).get("/api/eventos");
    const evento = resEventos.body.find((e) => e.nombre.includes("Coldplay"));
    eventoId = evento.id;
    tipoEntradaId = evento.tiposEntrada[0].id;
  });

  describe("POST /api/eventos/:id/resenias (Crear Reseña - CU-09)", () => {
    test("debería fallar sin token con 401 Unauthorized", async () => {
      const res = await request(app)
        .post(`/api/eventos/${eventoId}/resenias`)
        .send({ puntuacion: 5, detalle: "Gran recital" });

      expect(res.status).toBe(401);
    });

    test("debería fallar si un Organizador intenta calificar con 403 Forbidden", async () => {
      const res = await request(app)
        .post(`/api/eventos/${eventoId}/resenias`)
        .set("Authorization", `Bearer ${organizadorToken}`)
        .send({ puntuacion: 5, detalle: "Autoelogio" });

      expect(res.status).toBe(403);
    });

    test("debería fallar con 422 si el comprador no tiene entrada en estado UTILIZADA", async () => {
      // Mariana no compró ni asistió al evento
      const res = await request(app)
        .post(`/api/eventos/${eventoId}/resenias`)
        .set("Authorization", `Bearer ${otroCompradorToken}`)
        .send({ puntuacion: 4.5, detalle: "No fui pero opino" });

      expect(res.status).toBe(422);
      expect(res.body.message).toMatch(/UTILIZADA/i);
    });

    test("debería fallar con 400 o 422 si los datos de la reseña son inválidos", async () => {
      // Otorgar entrada UTILIZADA para poder validar el cuerpo
      const resOtro = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${otroCompradorToken}`);
      const marianaId = resOtro.body.id;

      await CompraRepository.guardar(
        new Compra({
          compradorId: marianaId,
          eventoId,
          tipoEntradaId,
          cantidad: 1,
          precioUnitario: 18000,
          estado: EstadoCompra.UTILIZADA,
        })
      );

      // Puntuación fuera de rango
      const resInvalido = await request(app)
        .post(`/api/eventos/${eventoId}/resenias`)
        .set("Authorization", `Bearer ${otroCompradorToken}`)
        .send({ puntuacion: 6, detalle: "Increíble" });

      expect([400, 422]).toContain(resInvalido.status);

      // Detalle vacío
      const resVacio = await request(app)
        .post(`/api/eventos/${eventoId}/resenias`)
        .set("Authorization", `Bearer ${otroCompradorToken}`)
        .send({ puntuacion: 5, detalle: "" });

      expect([400, 422]).toContain(resVacio.status);
    });

    test("debería crear la reseña exitosamente cuando el comprador tiene entrada UTILIZADA", async () => {
      const resOtro = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${otroCompradorToken}`);
      const marianaId = resOtro.body.id;

      await CompraRepository.guardar(
        new Compra({
          compradorId: marianaId,
          eventoId,
          tipoEntradaId,
          cantidad: 1,
          precioUnitario: 18000,
          estado: EstadoCompra.UTILIZADA,
        })
      );

      const res = await request(app)
        .post(`/api/eventos/${eventoId}/resenias`)
        .set("Authorization", `Bearer ${otroCompradorToken}`)
        .send({
          puntuacion: 4.5,
          detalle: "Impresionante puesta en escena y sonido perfecto.",
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body.puntuacion).toBe(4.5);
      expect(res.body.detalle).toBe("Impresionante puesta en escena y sonido perfecto.");
      expect(res.body.comprador).toBeDefined();
      expect(res.body.comprador.nombre).toBe("Mariana");
    });

    test("debería rechazar con 409 Conflict si el comprador intenta reseñar el mismo evento dos veces", async () => {
      const resOtro = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${otroCompradorToken}`);
      const marianaId = resOtro.body.id;

      await CompraRepository.guardar(
        new Compra({
          compradorId: marianaId,
          eventoId,
          tipoEntradaId,
          cantidad: 1,
          precioUnitario: 18000,
          estado: EstadoCompra.UTILIZADA,
        })
      );

      // Primera reseña
      await request(app)
        .post(`/api/eventos/${eventoId}/resenias`)
        .set("Authorization", `Bearer ${otroCompradorToken}`)
        .send({ puntuacion: 5, detalle: "Primera reseña" });

      // Segunda reseña para el mismo evento
      const resDuplicada = await request(app)
        .post(`/api/eventos/${eventoId}/resenias`)
        .set("Authorization", `Bearer ${otroCompradorToken}`)
        .send({ puntuacion: 4, detalle: "Intento repetir reseña" });

      expect(resDuplicada.status).toBe(409);
    });
  });

  describe("GET /api/eventos/:id/resenias (Listar Reseñas del Evento)", () => {
    test("debería listar las reseñas existentes del evento", async () => {
      const resEventos = await request(app).get("/api/eventos");
      const rockNacional = resEventos.body.find((e) => e.nombre.includes("Rock Nacional"));

      const res = await request(app).get(`/api/eventos/${rockNacional.id}/resenias`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
      expect(res.body[0].puntuacion).toBe(5);
      expect(res.body[0].comprador).toBeDefined();
      expect(res.body[0].comprador.email).toBeUndefined(); // Privacidad
    });

    test("debería devolver 404 si el evento no existe", async () => {
      const res = await request(app).get("/api/eventos/evento-inexistente/resenias");
      expect(res.status).toBe(404);
    });
  });

  describe("GET /api/organizadores/:id/resenias (Historial y Reputación - CU-10)", () => {
    test("debería devolver el promedio de reputación y las reseñas históricas", async () => {
      const res = await request(app).get(`/api/organizadores/${organizadorId}/resenias`);

      expect(res.status).toBe(200);
      expect(res.body.organizadorId).toBe(organizadorId);
      expect(res.body.reputacion).toBe(5);
      expect(res.body.totalResenias).toBeGreaterThanOrEqual(1);
      expect(Array.isArray(res.body.resenias)).toBe(true);
      expect(res.body.resenias[0].nombreEvento).toBeDefined();
    });

    test("debería devolver 404 si el organizador no existe", async () => {
      const res = await request(app).get("/api/organizadores/org-inexistente/resenias");
      expect(res.status).toBe(404);
    });
  });

  describe("GET /api/eventos/:id (Enriquecimiento con Reputación - CU-10)", () => {
    test("debería incluir la reputación y reseñas anteriores del organizador", async () => {
      const res = await request(app).get(`/api/eventos/${eventoId}`);

      expect(res.status).toBe(200);
      expect(res.body.organizador).toBeDefined();
      expect(res.body.organizador.reputacion).toBe(5);
      expect(res.body.organizador.totalResenias).toBeGreaterThanOrEqual(1);
      expect(Array.isArray(res.body.reseniasAnteriores)).toBe(true);
      expect(res.body.reseniasAnteriores.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("GET /api/eventos?sortBy=puntaje (Ordenamiento por Reputación - CU-11)", () => {
    test("debería ordenar eventos por puntaje del organizador correctamente", async () => {
      const resDesc = await request(app).get("/api/eventos?sortBy=puntaje&order=desc");

      expect(resDesc.status).toBe(200);
      expect(resDesc.body.length).toBeGreaterThan(1);
      const primero = resDesc.body[0];
      const ultimo = resDesc.body[resDesc.body.length - 1];
      expect(primero.puntajePromedio).toBeGreaterThanOrEqual(ultimo.puntajePromedio);
    });
  });
});
