import { Resenia } from "../../src/models/Resenia.js";
import { UnprocessableEntityError } from "../../src/errors/AppError.js";

describe("Modelo de Dominio: Resenia (Calificaciones y Reputación)", () => {
  const datosValidos = {
    id: "rev-1",
    compradorId: "user-comprador",
    eventoId: "event-1",
    organizadorId: "user-organizador",
    puntuacion: 4.5,
    detalle: "Excelente sonido y organización general.",
  };

  test("debería instanciarse correctamente con datos válidos", () => {
    const resenia = new Resenia(datosValidos);

    expect(resenia.id).toBe("rev-1");
    expect(resenia.compradorId).toBe("user-comprador");
    expect(resenia.eventoId).toBe("event-1");
    expect(resenia.organizadorId).toBe("user-organizador");
    expect(resenia.puntuacion).toBe(4.5);
    expect(resenia.detalle).toBe("Excelente sonido y organización general.");
    expect(resenia.fecha).toBeDefined();
  });

  test("debería redondear la puntuación a un decimal", () => {
    const resenia = new Resenia({ ...datosValidos, puntuacion: 4.66 });
    expect(resenia.puntuacion).toBe(4.7);
  });

  test("debería fallar si falta el compradorId", () => {
    expect(() => new Resenia({ ...datosValidos, compradorId: "" })).toThrow(
      UnprocessableEntityError
    );
    expect(() => new Resenia({ ...datosValidos, compradorId: null })).toThrow(
      UnprocessableEntityError
    );
  });

  test("debería fallar si falta el eventoId", () => {
    expect(() => new Resenia({ ...datosValidos, eventoId: "   " })).toThrow(
      UnprocessableEntityError
    );
  });

  test("debería fallar si falta el organizadorId", () => {
    expect(() => new Resenia({ ...datosValidos, organizadorId: "" })).toThrow(
      UnprocessableEntityError
    );
  });

  test("debería fallar si la puntuación es menor a 1.0 o mayor a 5.0", () => {
    expect(() => new Resenia({ ...datosValidos, puntuacion: 0.5 })).toThrow(
      UnprocessableEntityError
    );
    expect(() => new Resenia({ ...datosValidos, puntuacion: 5.5 })).toThrow(
      UnprocessableEntityError
    );
    expect(() => new Resenia({ ...datosValidos, puntuacion: "no-numero" })).toThrow(
      UnprocessableEntityError
    );
  });

  test("debería fallar si el detalle está vacío o solo contiene espacios", () => {
    expect(() => new Resenia({ ...datosValidos, detalle: "" })).toThrow(
      UnprocessableEntityError
    );
    expect(() => new Resenia({ ...datosValidos, detalle: "   " })).toThrow(
      UnprocessableEntityError
    );
  });

  test("toJSON() debería devolver la representación plana esperada", () => {
    const resenia = new Resenia(datosValidos);
    const json = resenia.toJSON();

    expect(json).toEqual({
      id: "rev-1",
      compradorId: "user-comprador",
      eventoId: "event-1",
      organizadorId: "user-organizador",
      puntuacion: 4.5,
      detalle: "Excelente sonido y organización general.",
      fecha: resenia.fecha,
    });
  });
});
