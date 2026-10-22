import { Compra } from "../../src/models/Compra.js";
import { EstadoCompra } from "../../src/models/enums.js";
import { UnprocessableEntityError } from "../../src/errors/AppError.js";

describe("Modelo de Dominio: Compra", () => {
  const datosValidos = {
    id: "comp-1",
    compradorId: "user-1",
    eventoId: "event-1",
    tipoEntradaId: "tipo-1",
    cantidad: 2,
    precioUnitario: 15000,
  };

  test("debería instanciarse en estado PENDIENTE por defecto con total calculado", () => {
    const compra = new Compra(datosValidos);

    expect(compra.id).toBe("comp-1");
    expect(compra.compradorId).toBe("user-1");
    expect(compra.eventoId).toBe("event-1");
    expect(compra.tipoEntradaId).toBe("tipo-1");
    expect(compra.cantidad).toBe(2);
    expect(compra.precioUnitario).toBe(15000);
    expect(compra.total).toBe(30000);
    expect(compra.estado).toBe(EstadoCompra.PENDIENTE);
    expect(compra.fechaCompra).toBeDefined();
    expect(compra.fechaExpiracion).toBeDefined();
    expect(compra.historialEstados.length).toBe(1);
    expect(compra.historialEstados[0].estadoNuevo).toBe(EstadoCompra.PENDIENTE);
  });

  test("haExpirado debería retornar true si se supera la fecha de expiración", () => {
    const compra = new Compra(datosValidos);
    const ahora = new Date();

    // Recién creada no expiró
    expect(compra.haExpirado(ahora)).toBe(false);

    // 20 minutos después ya expiró
    const veinteMinutosDespues = new Date(ahora.getTime() + 20 * 60 * 1000);
    expect(compra.haExpirado(veinteMinutosDespues)).toBe(true);
  });

  test("actualizarEstado debería permitir transiciones válidas y registrar en historial", () => {
    const compra = new Compra(datosValidos);

    // PENDIENTE -> CONFIRMADA
    compra.actualizarEstado(EstadoCompra.CONFIRMADA, "user-1", "Pago aprobado");
    expect(compra.estado).toBe(EstadoCompra.CONFIRMADA);
    expect(compra.historialEstados.length).toBe(2);
    expect(compra.historialEstados[1].estadoAnterior).toBe(EstadoCompra.PENDIENTE);
    expect(compra.historialEstados[1].estadoNuevo).toBe(EstadoCompra.CONFIRMADA);

    // CONFIRMADA -> UTILIZADA
    compra.actualizarEstado(EstadoCompra.UTILIZADA, "user-2", "Ingreso al show");
    expect(compra.estado).toBe(EstadoCompra.UTILIZADA);
    expect(compra.historialEstados.length).toBe(3);
  });

  test("actualizarEstado debería rechazar transiciones inválidas", () => {
    const compra = new Compra(datosValidos);

    // PENDIENTE -> UTILIZADA no es válida
    expect(() => compra.actualizarEstado(EstadoCompra.UTILIZADA, "user-1")).toThrow(
      UnprocessableEntityError
    );

    // PENDIENTE -> REEMBOLSADA no es válida (solo CONFIRMADA se reembolsa)
    expect(() => compra.actualizarEstado(EstadoCompra.REEMBOLSADA, "user-1")).toThrow(
      UnprocessableEntityError
    );
  });

  test("calcularDiasFaltantes debería calcular correctamente para compras CONFIRMADAS", () => {
    const compra = new Compra({ ...datosValidos, estado: EstadoCompra.CONFIRMADA });
    const hoy = new Date("2026-11-01T12:00:00Z");

    // Evento en 10 días
    const fechaEventoFutura = "2026-11-11T20:00:00Z";
    const resFuturo = compra.calcularDiasFaltantes(fechaEventoFutura, hoy);
    expect(resFuturo.diasFaltantes).toBe(11);
    expect(resFuturo.eventoFinalizado).toBe(false);

    // Evento pasado
    const fechaEventoPasada = "2026-10-25T20:00:00Z";
    const resPasado = compra.calcularDiasFaltantes(fechaEventoPasada, hoy);
    expect(resPasado.diasFaltantes).toBe(0);
    expect(resPasado.eventoFinalizado).toBe(true);
  });

  test("calcularDiasFaltantes debería devolver null para compras no confirmadas", () => {
    const compraPendiente = new Compra(datosValidos);
    expect(compraPendiente.calcularDiasFaltantes("2026-12-01T00:00:00Z")).toBeNull();

    const compraCancelada = new Compra({ ...datosValidos, estado: EstadoCompra.CANCELADA });
    expect(compraCancelada.calcularDiasFaltantes("2026-12-01T00:00:00Z")).toBeNull();
  });
});
