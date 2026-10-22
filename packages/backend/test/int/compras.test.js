import request from "supertest";
import app from "../../src/app.js";
import { inMemoryStore } from "../../src/repositories/InMemoryStore.js";
import { cargarSeeds } from "../../src/seeds/seedData.js";
import { EstadoCompra } from "../../src/models/enums.js";

describe("Integración: Circuito de Compras, Cupos y Estados API", () => {
  let compradorToken = "";
  let organizadorToken = "";
  let organizadorId = "";
  let eventoId = "";
  let tipoEntradaId = "";
  let precioEntrada = 0;

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

    // Obtener un evento futuro y tipo de entrada
    const resEventos = await request(app).get("/api/eventos");
    const evento = resEventos.body.find((e) => new Date(e.fecha) > new Date());
    eventoId = evento.id;
    tipoEntradaId = evento.tiposEntrada[0].id;
    precioEntrada = evento.tiposEntrada[0].precio;
  });

  describe("POST /api/compras (Adquisición de Entradas - CU-12)", () => {
    test("debería fallar sin token con 401", async () => {
      const res = await request(app).post("/api/compras").send({
        eventoId,
        tipoEntradaId,
        cantidad: 2,
      });

      expect(res.status).toBe(401);
    });

    test("debería fallar si un Organizador intenta comprar con 403", async () => {
      const res = await request(app)
        .post("/api/compras")
        .set("Authorization", `Bearer ${organizadorToken}`)
        .send({
          eventoId,
          tipoEntradaId,
          cantidad: 1,
        });

      expect(res.status).toBe(403);
    });

    test("debería crear compra en estado PENDIENTE y descontar cupo atómicamente", async () => {
      // Cupo antes
      const resAntes = await request(app).get(`/api/eventos/${eventoId}`);
      const tipoAntes = resAntes.body.tiposEntrada.find((t) => t.id === tipoEntradaId);
      const cupoInicial = tipoAntes.cupoDisponible;

      const res = await request(app)
        .post("/api/compras")
        .set("Authorization", `Bearer ${compradorToken}`)
        .send({
          eventoId,
          tipoEntradaId,
          cantidad: 3,
        });

      expect(res.status).toBe(201);
      expect(res.body.estado).toBe(EstadoCompra.PENDIENTE);
      expect(res.body.cantidad).toBe(3);
      expect(res.body.total).toBe(precioEntrada * 3);
      expect(res.body.fechaExpiracion).toBeDefined();

      // Cupo después
      const resDespues = await request(app).get(`/api/eventos/${eventoId}`);
      const tipoDespues = resDespues.body.tiposEntrada.find((t) => t.id === tipoEntradaId);
      expect(tipoDespues.cupoDisponible).toBe(cupoInicial - 3);
    });

    test("debería fallar si la cantidad solicitada supera el cupo disponible", async () => {
      const res = await request(app)
        .post("/api/compras")
        .set("Authorization", `Bearer ${compradorToken}`)
        .send({
          eventoId,
          tipoEntradaId,
          cantidad: 999999,
        });

      expect(res.status).toBe(422);
      expect(res.body.message).toContain("Cupo insuficiente");
    });
  });

  describe("POST /api/compras/:id/pagos (Confirmación de Pago)", () => {
    test("debería pasar compra de PENDIENTE a CONFIRMADA tras el pago", async () => {
      // Crear compra
      const resCompra = await request(app)
        .post("/api/compras")
        .set("Authorization", `Bearer ${compradorToken}`)
        .send({ eventoId, tipoEntradaId, cantidad: 1 });
      const compraId = resCompra.body.id;

      // Pagar compra
      const resPago = await request(app)
        .post(`/api/compras/${compraId}/pagos`)
        .set("Authorization", `Bearer ${compradorToken}`)
        .send({ metodoPago: "TARJETA_VISA" });

      expect(resPago.status).toBe(200);
      expect(resPago.body.estado).toBe(EstadoCompra.CONFIRMADA);
      expect(resPago.body.historialEstados.length).toBe(2);
      expect(resPago.body.historialEstados[1].estadoNuevo).toBe(EstadoCompra.CONFIRMADA);
    });
  });

  describe("GET /api/compras/mis-compras (CU-01)", () => {
    test("debería listar compras del comprador con cálculo dinámico de diasFaltantes", async () => {
      const res = await request(app)
        .get("/api/compras/mis-compras")
        .set("Authorization", `Bearer ${compradorToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);

      // Compras confirmadas deben incluir diasFaltantes no nulo
      const confirmada = res.body.find((c) => c.estado === EstadoCompra.CONFIRMADA);
      if (confirmada) {
        expect(confirmada.diasFaltantes).not.toBeNull();
        expect(typeof confirmada.diasFaltantes).toBe("number");
        expect(confirmada.eventoFinalizado).toBe(false);
      }

      // Compras pendientes deben tener diasFaltantes en null
      const pendiente = res.body.find((c) => c.estado === EstadoCompra.PENDIENTE);
      if (pendiente) {
        expect(pendiente.diasFaltantes).toBeNull();
      }
    });
  });

  describe("PATCH /api/compras/:id/estado (Cancelación, Reembolso y Utilización - CU-07, CU-08)", () => {
    test("cancelar/reembolsar compra CONFIRMADA debería pasar a REEMBOLSADA y reintegrar cupo", async () => {
      // 1. Crear y confirmar compra de 2 entradas
      const resCompra = await request(app)
        .post("/api/compras")
        .set("Authorization", `Bearer ${compradorToken}`)
        .send({ eventoId, tipoEntradaId, cantidad: 2 });
      const compraId = resCompra.body.id;

      await request(app)
        .post(`/api/compras/${compraId}/pagos`)
        .set("Authorization", `Bearer ${compradorToken}`)
        .send({ metodoPago: "TARJETA_SIMULADA" });

      // Cupo antes de cancelar
      const resAntes = await request(app).get(`/api/eventos/${eventoId}`);
      const cupoAntes = resAntes.body.tiposEntrada.find((t) => t.id === tipoEntradaId).cupoDisponible;

      // 2. Cancelar para obtener reembolso (CU-07)
      const resCancel = await request(app)
        .patch(`/api/compras/${compraId}/estado`)
        .set("Authorization", `Bearer ${compradorToken}`)
        .send({
          estado: EstadoCompra.REEMBOLSADA,
          motivo: "No puedo asistir por viaje",
        });

      expect(resCancel.status).toBe(200);
      expect(resCancel.body.estado).toBe(EstadoCompra.REEMBOLSADA);

      // 3. Verificar que se reintegró el cupo disponible (CU-08)
      const resDespues = await request(app).get(`/api/eventos/${eventoId}`);
      const cupoDespues = resDespues.body.tiposEntrada.find((t) => t.id === tipoEntradaId).cupoDisponible;
      expect(cupoDespues).toBe(cupoAntes + 2);
    });

    test("marcar entrada como UTILIZADA solo debe ser permitido por el Organizador del evento", async () => {
      // 1. Crear y confirmar compra
      const resCompra = await request(app)
        .post("/api/compras")
        .set("Authorization", `Bearer ${compradorToken}`)
        .send({ eventoId, tipoEntradaId, cantidad: 1 });
      const compraId = resCompra.body.id;

      await request(app)
        .post(`/api/compras/${compraId}/pagos`)
        .set("Authorization", `Bearer ${compradorToken}`)
        .send({ metodoPago: "TARJETA_SIMULADA" });

      // Comprador no puede marcar como UTILIZADA (403)
      const resCompradorIntento = await request(app)
        .patch(`/api/compras/${compraId}/estado`)
        .set("Authorization", `Bearer ${compradorToken}`)
        .send({ estado: EstadoCompra.UTILIZADA });
      expect(resCompradorIntento.status).toBe(403);

      // Organizador dueño sí puede marcar como UTILIZADA
      const resOrganizador = await request(app)
        .patch(`/api/compras/${compraId}/estado`)
        .set("Authorization", `Bearer ${organizadorToken}`)
        .send({ estado: EstadoCompra.UTILIZADA, motivo: "Entrada escaneada en puerta" });

      expect(resOrganizador.status).toBe(200);
      expect(resOrganizador.body.estado).toBe(EstadoCompra.UTILIZADA);

      // Intentar reembolsar una entrada UTILIZADA debe fallar con 422 (CU-08)
      const resReembolsoFallo = await request(app)
        .patch(`/api/compras/${compraId}/estado`)
        .set("Authorization", `Bearer ${compradorToken}`)
        .send({ estado: EstadoCompra.REEMBOLSADA });

      expect(resReembolsoFallo.status).toBe(422);
    });
  });

  describe("GET /api/eventos/:id/compras (CU-02)", () => {
    test("debería permitir al organizador dueño ver las compras y cupos restantes", async () => {
      const res = await request(app)
        .get(`/api/eventos/${eventoId}/compras`)
        .set("Authorization", `Bearer ${organizadorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.eventoId).toBe(eventoId);
      expect(res.body).toHaveProperty("cuposPorTipoEntrada");
      expect(Array.isArray(res.body.cuposPorTipoEntrada)).toBe(true);
      expect(res.body.cuposPorTipoEntrada[0]).toHaveProperty("cupoDisponible");
      expect(res.body.cuposPorTipoEntrada[0]).toHaveProperty("entradasVendidas");
      expect(res.body).toHaveProperty("totalRecaudado");
      expect(Array.isArray(res.body.compras)).toBe(true);
    });

    test("debería rechazar a un comprador con 403 Forbidden", async () => {
      const res = await request(app)
        .get(`/api/eventos/${eventoId}/compras`)
        .set("Authorization", `Bearer ${compradorToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe("GET /api/compras/:id", () => {
    test("debería devolver el detalle de la compra con su historial de estados completo", async () => {
      const resLista = await request(app)
        .get("/api/compras/mis-compras")
        .set("Authorization", `Bearer ${compradorToken}`);
      const compraId = resLista.body[0].id;

      const res = await request(app)
        .get(`/api/compras/${compraId}`)
        .set("Authorization", `Bearer ${compradorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(compraId);
      expect(res.body).toHaveProperty("historialEstados");
      expect(Array.isArray(res.body.historialEstados)).toBe(true);
      expect(res.body.historialEstados.length).toBeGreaterThan(0);
    });
  });
});
