import { UsuarioRepository } from "../../src/repositories/UsuarioRepository.js";
import { inMemoryStore } from "../../src/repositories/InMemoryStore.js";
import { Usuario } from "../../src/models/Usuario.js";
import { RolUsuario } from "../../src/models/enums.js";
import { ConflictError } from "../../src/errors/AppError.js";

describe("Repositorio: UsuarioRepository", () => {
  beforeEach(async () => {
    inMemoryStore.reset();
  });

  test("debería guardar un usuario y asignarle un ID incremental", async () => {
    const usuario = new Usuario({
      nombre: "Ana",
      apellido: "Gómez",
      email: "ana@test.com",
      passwordHash: "hash123",
      rol: RolUsuario.ORGANIZADOR,
    });

    const guardado = await UsuarioRepository.guardar(usuario);

    expect(guardado.id).toBe("user-1");
    expect(guardado.nombre).toBe("Ana");

    const encontrado = await UsuarioRepository.buscarPorId("user-1");
    expect(encontrado).not.toBeNull();
    expect(encontrado.email).toBe("ana@test.com");
  });

  test("debería buscar usuario por email (case-insensitive)", async () => {
    const usuario = new Usuario({
      nombre: "Pedro",
      apellido: "López",
      email: "pedro@test.com",
      passwordHash: "hash123",
      rol: RolUsuario.COMPRADOR,
    });
    await UsuarioRepository.guardar(usuario);

    const encontrado = await UsuarioRepository.buscarPorEmail("PEDRO@TEST.COM");
    expect(encontrado).not.toBeNull();
    expect(encontrado.id).toBe("user-1");
  });

  test("debería rechazar usuarios con email duplicado", async () => {
    const u1 = new Usuario({
      nombre: "Usuario 1",
      apellido: "Test",
      email: "repetido@test.com",
      passwordHash: "hash1",
      rol: RolUsuario.COMPRADOR,
    });
    await UsuarioRepository.guardar(u1);

    const u2 = new Usuario({
      nombre: "Usuario 2",
      apellido: "Test",
      email: "repetido@test.com",
      passwordHash: "hash2",
      rol: RolUsuario.ORGANIZADOR,
    });

    await expect(UsuarioRepository.guardar(u2)).rejects.toThrow(ConflictError);
  });

  test("debería listar todos los usuarios y permitir eliminarlos por id", async () => {
    const u1 = new Usuario({
      nombre: "A",
      apellido: "A",
      email: "a@test.com",
      passwordHash: "h",
      rol: RolUsuario.COMPRADOR,
    });
    const u2 = new Usuario({
      nombre: "B",
      apellido: "B",
      email: "b@test.com",
      passwordHash: "h",
      rol: RolUsuario.ORGANIZADOR,
    });

    await UsuarioRepository.guardar(u1);
    await UsuarioRepository.guardar(u2);

    let todos = await UsuarioRepository.buscarTodos();
    expect(todos.length).toBe(2);

    const borrado = await UsuarioRepository.eliminarPorId(u1.id);
    expect(borrado).toBe(true);

    todos = await UsuarioRepository.buscarTodos();
    expect(todos.length).toBe(1);
    expect(todos[0].id).toBe(u2.id);
  });
});
