import { CambioEstadoCompra } from "../../src/models/CambioEstadoCompra.js";
import { EstadoCompra } from "../../src/models/enums.js";
import { UnprocessableEntityError } from "../../src/errors/AppError.js";

describe("Modelo de Dominio: CambioEstadoCompra", () => {
  const datosValidos = {
    id: "cambio-1",
    compraId: "comp-1",
    estadoAnterior: EstadoCompra.PENDIENTE,
    estadoNuevo: EstadoCompra.CONFIRMADA,
    quienId: "user-1",
    motivo: "Pago confirmado",
  };

  test("debería instanciarse correctamente con datos válidos", () => {
    const cambio = new CambioEstadoCompra(datosValidos);

    expect(cambio.id).toBe("cambio-1");
    expect(cambio.compraId).toBe("comp-1");
    expect(cambio.estadoAnterior).toBe(EstadoCompra.PENDIENTE);
    expect(cambio.estadoNuevo).toBe(EstadoCompra.CONFIRMADA);
    expect(cambio.quienId).toBe("user-1");
    expect(cambio.motivo).toBe("Pago confirmado");
    expect(cambio.fechaHora).toBeDefined();
  });

  test("debería fallar si falta el compraId o está vacío", () => {
    expect(() => new CambioEstadoCompra({ ...datosValidos, compraId: "" })).toThrow(UnprocessableEntityError);
  });

  test("debería fallar si falta quienId o está vacío", () => {
    expect(() => new CambioEstadoCompra({ ...datosValidos, quienId: null })).toThrow(UnprocessableEntityError);
  });

  test("debería fallar si el estadoNuevo es desconocido", () => {
    expect(() => new CambioEstadoCompra({ ...datosValidos, estadoNuevo: "ESTADO_FALSO" })).toThrow(
      UnprocessableEntityError
    );
  });

  test("toJSON() debería devolver la representación plana", () => {
    const cambio = new CambioEstadoCompra(datosValidos);
    const json = cambio.toJSON();

    expect(json).toEqual({
      id: "cambio-1",
      compraId: "comp-1",
      estadoAnterior: EstadoCompra.PENDIENTE,
      estadoNuevo: EstadoCompra.CONFIRMADA,
      quienId: "user-1",
      fechaHora: cambio.fechaHora,
      motivo: "Pago confirmado",
    });
  });
});
