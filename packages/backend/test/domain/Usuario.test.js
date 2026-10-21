import { Usuario } from "../../src/models/Usuario.js";
import { RolUsuario } from "../../src/models/enums.js";
import { UnprocessableEntityError } from "../../src/errors/AppError.js";

describe("Modelo de Dominio: Usuario", () => {
  const datosValidos = {
    nombre: "Juan",
    apellido: "Pérez",
    email: "juan.perez@test.com",
    passwordHash: "hashed-secret",
    rol: RolUsuario.COMPRADOR,
  };

  test("debería instanciarse correctamente con datos válidos", () => {
    const usuario = new Usuario(datosValidos);

    expect(usuario.nombre).toBe("Juan");
    expect(usuario.apellido).toBe("Pérez");
    expect(usuario.email).toBe("juan.perez@test.com");
    expect(usuario.rol).toBe(RolUsuario.COMPRADOR);
    expect(usuario.esComprador()).toBe(true);
    expect(usuario.esOrganizador()).toBe(false);
    expect(usuario.favoritos).toEqual([]);
  });

  test("debería fallar si falta el nombre o está vacío", () => {
    expect(() => new Usuario({ ...datosValidos, nombre: "" })).toThrow(UnprocessableEntityError);
    expect(() => new Usuario({ ...datosValidos, nombre: null })).toThrow(UnprocessableEntityError);
  });

  test("debería fallar si falta el apellido o está vacío", () => {
    expect(() => new Usuario({ ...datosValidos, apellido: "   " })).toThrow(UnprocessableEntityError);
  });

  test("debería fallar si el email no es válido", () => {
    expect(() => new Usuario({ ...datosValidos, email: "invalido" })).toThrow(UnprocessableEntityError);
  });

  test("debería fallar si el rol es desconocido", () => {
    expect(() => new Usuario({ ...datosValidos, rol: "ADMIN_DESCONOCIDO" })).toThrow(UnprocessableEntityError);
  });

  test("debería permitir agregar, consultar y quitar favoritos", () => {
    const usuario = new Usuario(datosValidos);
    usuario.agregarFavorito("evento-1");
    usuario.agregarFavorito("evento-2");
    usuario.agregarFavorito("evento-1"); // No duplicar

    expect(usuario.favoritos).toEqual(["evento-1", "evento-2"]);
    expect(usuario.esFavorito("evento-1")).toBe(true);
    expect(usuario.esFavorito("evento-99")).toBe(false);

    usuario.quitarFavorito("evento-1");
    expect(usuario.esFavorito("evento-1")).toBe(false);
    expect(usuario.favoritos).toEqual(["evento-2"]);
  });

  test("toPublicJSON() no debe exponer el passwordHash", () => {
    const usuario = new Usuario(datosValidos);
    const json = usuario.toPublicJSON();

    expect(json.email).toBe("juan.perez@test.com");
    expect(json.passwordHash).toBeUndefined();
    expect(json).toHaveProperty("rol", RolUsuario.COMPRADOR);
  });
});
