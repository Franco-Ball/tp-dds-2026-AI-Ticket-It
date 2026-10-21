import { z } from "zod";
import { AuthService } from "../services/AuthService.js";
import { RolUsuario } from "../models/enums.js";
import { BadRequestError, UnprocessableEntityError } from "../errors/AppError.js";

const registroEsquema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  apellido: z.string().min(1, "El apellido es obligatorio"),
  email: z.string().email("El formato de email es inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  rol: z.enum([RolUsuario.COMPRADOR, RolUsuario.ORGANIZADOR]).default(RolUsuario.COMPRADOR),
}).strict();

const loginEsquema = z.object({
  email: z.string().email("El formato de email es inválido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
}).strict();

export class AuthController {
  constructor(authService = new AuthService()) {
    this.authService = authService;
  }

  registrar = async (req, res, next) => {
    try {
      const datosValidados = this.validarBody(registroEsquema, req.body);
      const resultado = await this.authService.registrar(datosValidados);
      return res.status(201).json(resultado);
    } catch (error) {
      return next(error);
    }
  };

  login = async (req, res, next) => {
    try {
      const datosValidados = this.validarBody(loginEsquema, req.body);
      const resultado = await this.authService.login(datosValidados);
      return res.status(200).json(resultado);
    } catch (error) {
      return next(error);
    }
  };

  me = async (req, res, next) => {
    try {
      const usuario = await this.authService.obtenerPerfil(req.user.id);
      return res.status(200).json(usuario);
    } catch (error) {
      return next(error);
    }
  };

  validarBody(esquema, body) {
    const resultado = esquema.safeParse(body);
    if (resultado.success) {
      return resultado.data;
    }

    const esEstructural = resultado.error.issues.some(
      (issue) => issue.code === "invalid_type" || issue.code === "unrecognized_keys"
    );
    const detalle = resultado.error.issues
      .map((issue) => {
        const campo = issue.path.join(".");
        return campo ? `${campo}: ${issue.message}` : issue.message;
      })
      .join("; ");

    throw esEstructural ? new BadRequestError(detalle) : new UnprocessableEntityError(detalle);
  }
}
