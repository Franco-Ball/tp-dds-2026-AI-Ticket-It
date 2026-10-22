import { TipoEntrada } from "../../src/models/TipoEntrada.js";
import { UnprocessableEntityError } from "../../src/errors/AppError.js";

describe("Modelo de Dominio: TipoEntrada", () => {
  const datosValidos = {
    id: "tipo-1",
    nombre: "General",
    descripcion: "Entrada general de pie",
    precio: 15000,
    cupoTotal: 100,
    cupoDisponible: 100,
  };

  test("debería instanciarse correctamente con datos válidos", () => {
    const tipo = new TipoEntrada(datosValidos);

    expect(tipo.id).toBe("tipo-1");
    expect(tipo.nombre).toBe("General");
    expect(tipo.precio).toBe(15000);
    expect(tipo.cupoTotal).toBe(100);
    expect(tipo.cupoDisponible).toBe(100);
  });

  test("debería inicializar cupoDisponible igual a cupoTotal si no se especifica", () => {
    const tipo = new TipoEntrada({
      nombre: "VIP",
      precio: 30000,
      cupoTotal: 50,
    });

    expect(tipo.cupoDisponible).toBe(50);
  });

  test("debería fallar con nombre vacío o ausente", () => {
    expect(() => new TipoEntrada({ ...datosValidos, nombre: "" })).toThrow(UnprocessableEntityError);
  });

  test("debería fallar con precio negativo o inválido", () => {
    expect(() => new TipoEntrada({ ...datosValidos, precio: -100 })).toThrow(UnprocessableEntityError);
    expect(() => new TipoEntrada({ ...datosValidos, precio: "invalido" })).toThrow(UnprocessableEntityError);
  });

  test("debería fallar con cupo total inválido", () => {
    expect(() => new TipoEntrada({ ...datosValidos, cupoTotal: 0 })).toThrow(UnprocessableEntityError);
    expect(() => new TipoEntrada({ ...datosValidos, cupoTotal: -5 })).toThrow(UnprocessableEntityError);
    expect(() => new TipoEntrada({ ...datosValidos, cupoTotal: 10.5 })).toThrow(UnprocessableEntityError);
  });

  test("hayCupoPara debería retornar true solo si hay cantidad suficiente", () => {
    const tipo = new TipoEntrada({ ...datosValidos, cupoDisponible: 5 });

    expect(tipo.hayCupoPara(3)).toBe(true);
    expect(tipo.hayCupoPara(5)).toBe(true);
    expect(tipo.hayCupoPara(6)).toBe(false);
    expect(tipo.hayCupoPara(0)).toBe(false);
    expect(tipo.hayCupoPara(-1)).toBe(false);
  });

  test("decrementarCupo debería descontar si hay cupo y lanzar error si no alcanza", () => {
    const tipo = new TipoEntrada({ ...datosValidos, cupoDisponible: 10 });

    tipo.decrementarCupo(4);
    expect(tipo.cupoDisponible).toBe(6);

    expect(() => tipo.decrementarCupo(7)).toThrow(UnprocessableEntityError);
    expect(tipo.cupoDisponible).toBe(6); // no muta si falla
  });

  test("reintegrarCupo debería aumentar cupoDisponible sin exceder cupoTotal", () => {
    const tipo = new TipoEntrada({ ...datosValidos, cupoTotal: 100, cupoDisponible: 90 });

    tipo.reintegrarCupo(5);
    expect(tipo.cupoDisponible).toBe(95);

    // Intentar reintegrar más que el cupo total topeará en cupoTotal
    tipo.reintegrarCupo(20);
    expect(tipo.cupoDisponible).toBe(100);
  });
});
