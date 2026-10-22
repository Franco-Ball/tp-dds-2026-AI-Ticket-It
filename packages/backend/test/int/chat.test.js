import request from "supertest";
import app from "../../src/app.js";
import { inMemoryStore } from "../../src/repositories/InMemoryStore.js";
import { cargarSeeds } from "../../src/seeds/seedData.js";
import { EstadoCompra } from "../../src/models/enums.js";

describe("Integración: Chat en Compras API (CU-05 y CU-06)", () => {
  let compradorToken = "";
  let organizadorToken = "";
  let ajenoToken = "";
  let compraId = "";
  let eventoId = "";

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

    // Registrar un tercer usuario ajeno a la compra
    const resAjeno = await request(app)
      .post("/api/auth/register")
      .send({
        nombre: "Lucas",
        apellido: "Tercero",
        email: "lucas.ajeno@test.com",
        password: "password123",
      });
    ajenoToken = resAjeno.body.token;

    // Obtener un evento y crear una compra confirmada
    const resEventos = await request(app).get("/api/eventos");
    const evento = resEventos.body.find((e) => new Date(e.fecha) > new Date());
    eventoId = evento.id;
    const tipoEntradaId = evento.tiposEntrada[0].id;

    const resCompra = await request(app)
      .post("/api/compras")
      .set("Authorization", `Bearer ${compradorToken}`)
      .send({ eventoId, tipoEntradaId, cantidad: 1 });
    compraId = resCompra.body.id;

    // Pagar compra para confirmarla
    await request(app)
      .post(`/api/compras/${compraId}/pagos`)
      .set("Authorization", `Bearer ${compradorToken}`)
      .send({ metodoPago: "TARJETA_SIMULADA" });
  });

  describe("POST /api/compras/:id/mensajes (Enviar Mensaje - CU-05, CU-06)", () => {
    test("debería fallar sin token con 401 Unauthorized", async () => {
      const res = await request(app)
        .post(`/api/compras/${compraId}/mensajes`)
        .send({ mensaje: "Hola, tengo una duda" });

      expect(res.status).toBe(401);
    });

    test("debería fallar si un usuario ajeno intenta enviar un mensaje con 403 Forbidden", async () => {
      const res = await request(app)
        .post(`/api/compras/${compraId}/mensajes`)
        .set("Authorization", `Bearer ${ajenoToken}`)
        .send({ mensaje: "Intruso intentando escribir" });

      expect(res.status).toBe(403);
    });

    test("debería permitir al comprador titular enviar un mensaje (CU-05)", async () => {
      const res = await request(app)
        .post(`/api/compras/${compraId}/mensajes`)
        .set("Authorization", `Bearer ${compradorToken}`)
        .send({ mensaje: "¿A qué hora abren las puertas para campo general?" });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body.mensaje).toBe("¿A qué hora abren las puertas para campo general?");
      expect(res.body).toHaveProperty("remitente");
      expect(res.body.remitente.nombre).toBe("Carlos");
      expect(res.body.remitente.rol).toBe("COMPRADOR");
    });

    test("debería permitir al organizador del evento responder en el chat (CU-06)", async () => {
      // 1. Mensaje del comprador
      await request(app)
        .post(`/api/compras/${compraId}/mensajes`)
        .set("Authorization", `Bearer ${compradorToken}`)
        .send({ mensaje: "Consulta sobre estacionamiento" });

      // 2. Respuesta del organizador
      const res = await request(app)
        .post(`/api/compras/${compraId}/mensajes`)
        .set("Authorization", `Bearer ${organizadorToken}`)
        .send({ mensaje: "El estacionamiento abre 2 horas antes del inicio." });

      expect(res.status).toBe(201);
      expect(res.body.mensaje).toBe("El estacionamiento abre 2 horas antes del inicio.");
      expect(res.body.remitente.nombre).toBe("Olga");
      expect(res.body.remitente.rol).toBe("ORGANIZADOR");
    });

    test("debería fallar si se intenta enviar un mensaje en una compra REEMBOLSADA", async () => {
      // Reembolsar la compra
      await request(app)
        .patch(`/api/compras/${compraId}/estado`)
        .set("Authorization", `Bearer ${compradorToken}`)
        .send({ estado: EstadoCompra.REEMBOLSADA, motivo: "Viaje cancelado" });

      // Intentar enviar mensaje en compra reembolsada
      const res = await request(app)
        .post(`/api/compras/${compraId}/mensajes`)
        .set("Authorization", `Bearer ${compradorToken}`)
        .send({ mensaje: "Quiero consultar algo más" });

      expect(res.status).toBe(422);
      expect(res.body.message).toContain("No es posible enviar mensajes en una compra cancelada o reembolsada");
    });

    test("debería fallar si el mensaje está vacío", async () => {
      const res = await request(app)
        .post(`/api/compras/${compraId}/mensajes`)
        .set("Authorization", `Bearer ${compradorToken}`)
        .send({ mensaje: "   " });

      expect(res.status).toBe(422);
    });
  });

  describe("GET /api/compras/:id/mensajes (Historial de Mensajes)", () => {
    test("debería devolver el historial ordenado cronológicamente con remitentes", async () => {
      // Enviar dos mensajes
      await request(app)
        .post(`/api/compras/${compraId}/mensajes`)
        .set("Authorization", `Bearer ${compradorToken}`)
        .send({ mensaje: "¿Se suspende por lluvia?" });

      await request(app)
        .post(`/api/compras/${compraId}/mensajes`)
        .set("Authorization", `Bearer ${organizadorToken}`)
        .send({ mensaje: "No, no se suspende por lluvia." });

      const res = await request(app)
        .get(`/api/compras/${compraId}/mensajes`)
        .set("Authorization", `Bearer ${compradorToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
      expect(res.body[0].mensaje).toBe("¿Se suspende por lluvia?");
      expect(res.body[0].remitente.rol).toBe("COMPRADOR");
      expect(res.body[1].mensaje).toBe("No, no se suspende por lluvia.");
      expect(res.body[1].remitente.rol).toBe("ORGANIZADOR");
    });

    test("debería rechazar con 403 Forbidden a usuarios ajenos al consultar historial", async () => {
      const res = await request(app)
        .get(`/api/compras/${compraId}/mensajes`)
        .set("Authorization", `Bearer ${ajenoToken}`);

      expect(res.status).toBe(403);
    });
  });
});
