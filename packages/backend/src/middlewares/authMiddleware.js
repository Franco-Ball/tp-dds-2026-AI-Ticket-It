import { AuthService } from "../services/AuthService.js";
import { UnauthorizedError } from "../errors/AppError.js";

const defaultAuthService = new AuthService();

function handleAuth(authService, req, res, next) {
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
}

export function authMiddleware(arg = defaultAuthService, res, next) {
  // Si se usa directamente como middleware: router.use(authMiddleware)
  if (res && typeof next === "function") {
    return handleAuth(defaultAuthService, arg, res, next);
  }

  // Si se usa como factory: router.use(authMiddleware())
  const service = arg instanceof AuthService ? arg : defaultAuthService;
  return (req, res, nextHandler) => handleAuth(service, req, res, nextHandler);
}
