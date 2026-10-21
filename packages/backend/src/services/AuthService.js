import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Usuario } from "../models/Usuario.js";
import { RolUsuario } from "../models/enums.js";
import { UsuarioRepository } from "../repositories/UsuarioRepository.js";
import { UnauthorizedError, NotFoundError } from "../errors/AppError.js";

const DEFAULT_SECRET = "ai_ticket_it_super_secret_jwt_key_2026";
const DEFAULT_EXPIRES_IN = "24h";

export class AuthService {
  constructor(usuarioRepository = UsuarioRepository) {
    this.usuarioRepository = usuarioRepository;
  }

  registrar = async ({ nombre, apellido, email, password, rol = RolUsuario.COMPRADOR }) => {
    const passwordHash = bcrypt.hashSync(password, 10);
    const nuevoUsuario = new Usuario({
      nombre,
      apellido,
      email,
      passwordHash,
      rol,
    });

    const guardado = await this.usuarioRepository.guardar(nuevoUsuario);
    const token = this.generarToken(guardado);

    return {
      token,
      usuario: guardado.toPublicJSON(),
    };
  };

  login = async ({ email, password }) => {
    const usuario = await this.usuarioRepository.buscarPorEmail(email);
    if (!usuario) {
      throw new UnauthorizedError("Credenciales inválidas: email o contraseña incorrectos");
    }

    const passwordValido = bcrypt.compareSync(password, usuario.passwordHash);
    if (!passwordValido) {
      throw new UnauthorizedError("Credenciales inválidas: email o contraseña incorrectos");
    }

    const token = this.generarToken(usuario);

    return {
      token,
      usuario: usuario.toPublicJSON(),
    };
  };

  obtenerPerfil = async (id) => {
    const usuario = await this.usuarioRepository.buscarPorId(id);
    if (!usuario) {
      throw new NotFoundError(`No se encontró el usuario con id ${id}`);
    }
    return usuario.toPublicJSON();
  };

  generarToken(usuario) {
    const secret = process.env.JWT_SECRET || DEFAULT_SECRET;
    const expiresIn = process.env.JWT_EXPIRES_IN || DEFAULT_EXPIRES_IN;

    const payload = {
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
    };

    return jwt.sign(payload, secret, { expiresIn });
  }

  verificarToken(token) {
    try {
      const secret = process.env.JWT_SECRET || DEFAULT_SECRET;
      return jwt.verify(token, secret);
    } catch {
      throw new UnauthorizedError("Token inválido o expirado");
    }
  }
}
