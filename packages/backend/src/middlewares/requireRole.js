import { ForbiddenError, UnauthorizedError } from "../errors/AppError.js";

export function requireRole(...rolesPermitidos) {
  // Soporta tanto requireRole("ADMIN", "USER") como requireRole(["ADMIN", "USER"])
  const rolesAplanados = rolesPermitidos.flat();

  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError("Usuario no autenticado"));
    }

    if (!rolesAplanados.includes(req.user.rol)) {
      return next(
        new ForbiddenError(
          `Acceso denegado: se requiere uno de los siguientes roles: [${rolesAplanados.join(", ")}]. Tu rol actual es: ${req.user.rol}`
        )
      );
    }

    next();
  };
}
