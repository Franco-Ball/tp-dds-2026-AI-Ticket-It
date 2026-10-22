import { Mensaje } from "../../src/models/Mensaje.js";
import { UnprocessableEntityError } from "../../src/errors/AppError.js";

describe("Modelo de Dominio: Mensaje (Chat)", () => {
  const datosValidos = {
    id: "msg-1",
    compraId: "comp-1",
    usuarioId: "user-1",
    mensaje: "¿A qué hora abren las puertas del estadio?",
  };

  test("debería instanciarse correctamente con datos válidos", () => {
    const msg = new Mensaje(datosValidos);

    expect(msg.id).toBe("msg-1");
    expect(msg.compraId).toBe("comp-1");
    expect(msg.usuarioId).toBe("user-1");
    expect(msg.mensaje).toBe("¿A qué hora abren las puertas del estadio?");
    expect(msg.fechaEnvio).toBeDefined();
  });

  test("debería fallar si falta el compraId o está vacío", () => {
    expect(() => new Mensaje({ ...datosValidos, compraId: "" })).toThrow(UnprocessableEntityError);
    expect(() => new Mensaje({ ...datosValidos, compraId: null })).toThrow(UnprocessableEntityError);
  });

  test("debería fallar si falta el usuarioId o está vacío", () => {
    expect(() => new Mensaje({ ...datosValidos, usuarioId: "   " })).toThrow(UnprocessableEntityError);
  });

  test("debería fallar si el mensaje está vacío o solo contiene espacios", () => {
    expect(() => new Mensaje({ ...datosValidos, mensaje: "" })).toThrow(UnprocessableEntityError);
    expect(() => new Mensaje({ ...datosValidos, mensaje: "   " })).toThrow(UnprocessableEntityError);
  });

  test("toJSON() debería devolver la representación plana", () => {
    const msg = new Mensaje(datosValidos);
    const json = msg.toJSON();

    expect(json).toEqual({
      id: "msg-1",
      compraId: "comp-1",
      usuarioId: "user-1",
      mensaje: "¿A qué hora abren las puertas del estadio?",
      fechaEnvio: msg.fechaEnvio,
    });
  });
});
