import bcrypt from "bcryptjs";
import { Usuario } from "../models/Usuario.js";
import { RolUsuario } from "../models/enums.js";
import { UsuarioRepository } from "../repositories/UsuarioRepository.js";
import { inMemoryStore } from "../repositories/InMemoryStore.js";

export const USUARIOS_SEMILLA = [
  {
    nombre: "Carlos",
    apellido: "Comprador",
    email: "comprador@demo.com",
    passwordPlano: "comprador123",
    rol: RolUsuario.COMPRADOR,
  },
  {
    nombre: "Olga",
    apellido: "Organizadora",
    email: "organizador@demo.com",
    passwordPlano: "organizador123",
    rol: RolUsuario.ORGANIZADOR,
  },
];

export async function cargarSeeds(force = false) {
  if (inMemoryStore.isInitialized && !force) {
    return;
  }

  for (const item of USUARIOS_SEMILLA) {
    const existente = await UsuarioRepository.buscarPorEmail(item.email);
    if (!existente) {
      const passwordHash = bcrypt.hashSync(item.passwordPlano, 10);
      const usuario = new Usuario({
        nombre: item.nombre,
        apellido: item.apellido,
        email: item.email,
        passwordHash,
        rol: item.rol,
      });
      await UsuarioRepository.guardar(usuario);
    }
  }

  inMemoryStore.isInitialized = true;
  console.log("🌱 Datos semilla cargados exitosamente en InMemoryStore.");
}
