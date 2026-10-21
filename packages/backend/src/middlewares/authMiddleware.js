import { AuthService } from "../services/AuthService.js";
import { UnauthorizedError } from "../errors/AppError.js";

const defaultAuthService = new AuthService();

export function authMiddleware(authService = defaultAuthService) {
  return (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        throw new UnauthorizedError("Encabezado Authorization no provisto");
      }

      const partes = authHeader.split(" ");
      if (partes.length !== 2 || partes[0] !== "Bearer") {
        throw new UnauthorizedError("Formato de token inválido. Debe ser: Bearer <token>");
      }

      const token = partes[1];
      const payload = authService.verificarToken(token);
      req.user = payload;
      next();
    } catch (error) {
      next(error);
    }
  };
}
