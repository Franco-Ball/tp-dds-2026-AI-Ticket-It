import { Evento } from "../../src/models/Evento.js";
import { TipoEntrada } from "../../src/models/TipoEntrada.js";
import { UnprocessableEntityError, NotFoundError } from "../../src/errors/AppError.js";

describe("Modelo de Dominio: Evento", () => {
  const tiposEntradaValidos = [
    new TipoEntrada({
      id: "tipo-1",
      nombre: "General",
      precio: 10000,
      cupoTotal: 100,
      cupoDisponible: 80,
    }),
    new TipoEntrada({
      id: "tipo-2",
      nombre: "VIP",
      precio: 25000,
      cupoTotal: 40,
      cupoDisponible: 20,
    }),
  ];

  const datosValidos = {
    id: "event-1",
    nombre: "Recital de Rock",
    descripcion: "Increíble concierto de rock nacional",
    categoriaId: "cat-1",
    fecha: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    organizadorId: "user-2",
    multimedia: ["https://example.com/foto1.jpg"],
    tiposEntrada: tiposEntradaValidos,
  };

  test("debería instanciarse correctamente con datos válidos", () => {
    const evento = new Evento(datosValidos);

    expect(evento.id).toBe("event-1");
    expect(evento.nombre).toBe("Recital de Rock");
    expect(evento.categoriaId).toBe("cat-1");
    expect(evento.organizadorId).toBe("user-2");
    expect(evento.tiposEntrada.length).toBe(2);
    expect(evento.esOrganizador("user-2")).toBe(true);
    expect(evento.esOrganizador("user-99")).toBe(false);
    expect(evento.esFechaFutura()).toBe(true);
  });

  test("debería calcular precioMinimo y precioMaximo correctamente", () => {
    const evento = new Evento(datosValidos);

    expect(evento.precioMinimo()).toBe(10000);
    expect(evento.precioMaximo()).toBe(25000);
  });

  test("debería calcular cupoTotalDisponible sumando todos los tipos", () => {
    const evento = new Evento(datosValidos);
    // 80 + 20 = 100
    expect(evento.cupoTotalDisponible()).toBe(100);
  });

  test("tuPrecioEstaEntre debería evaluar si algún tipo cae en el rango", () => {
    const evento = new Evento(datosValidos);

    expect(evento.tuPrecioEstaEntre(5000, 15000)).toBe(true); // incluye General (10000)
    expect(evento.tuPrecioEstaEntre(20000, 30000)).toBe(true); // incluye VIP (25000)
    expect(evento.tuPrecioEstaEntre(1000, 5000)).toBe(false);
    expect(evento.tuPrecioEstaEntre(30000, 50000)).toBe(false);
  });

  test("obtenerTipoEntrada debería devolver el tipo o lanzar NotFoundError", () => {
    const evento = new Evento(datosValidos);

    const tipo = evento.obtenerTipoEntrada("tipo-2");
    expect(tipo.nombre).toBe("VIP");

    expect(() => evento.obtenerTipoEntrada("tipo-inexistente")).toThrow(NotFoundError);
  });

  test("debería fallar si faltan campos obligatorios", () => {
    expect(() => new Evento({ ...datosValidos, nombre: "" })).toThrow(UnprocessableEntityError);
    expect(() => new Evento({ ...datosValidos, descripcion: "" })).toThrow(UnprocessableEntityError);
    expect(() => new Evento({ ...datosValidos, categoriaId: null })).toThrow(UnprocessableEntityError);
    expect(() => new Evento({ ...datosValidos, fecha: "fecha-invalida" })).toThrow(UnprocessableEntityError);
    expect(() => new Evento({ ...datosValidos, organizadorId: null })).toThrow(UnprocessableEntityError);
    expect(() => new Evento({ ...datosValidos, tiposEntrada: [] })).toThrow(UnprocessableEntityError);
  });
});
