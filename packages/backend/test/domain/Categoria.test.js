import { Categoria } from "../../src/models/Categoria.js";
import { UnprocessableEntityError } from "../../src/errors/AppError.js";

describe("Modelo de Dominio: Categoria", () => {
  test("debería instanciarse correctamente con datos válidos", () => {
    const categoria = new Categoria({
      id: "cat-1",
      nombre: "Recitales",
      descripcion: "Conciertos de música en vivo",
    });

    expect(categoria.id).toBe("cat-1");
    expect(categoria.nombre).toBe("Recitales");
    expect(categoria.descripcion).toBe("Conciertos de música en vivo");
  });

  test("debería fallar si falta el nombre o está vacío", () => {
    expect(() => new Categoria({ nombre: "" })).toThrow(UnprocessableEntityError);
    expect(() => new Categoria({ nombre: "   " })).toThrow(UnprocessableEntityError);
    expect(() => new Categoria({ nombre: null })).toThrow(UnprocessableEntityError);
  });

  test("toJSON() debería devolver la representación plana", () => {
    const categoria = new Categoria({
      id: "cat-2",
      nombre: "Teatro",
    });

    expect(categoria.toJSON()).toEqual({
      id: "cat-2",
      nombre: "Teatro",
      descripcion: "",
    });
  });
});
