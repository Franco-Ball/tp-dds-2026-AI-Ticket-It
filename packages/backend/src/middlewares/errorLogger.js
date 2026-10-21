export function errorLogger(err, req, res, next) {
  // En ambiente de test podemos silenciar los logs de error previstos
  if (process.env.NODE_ENV !== "test") {
    console.error({
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.originalUrl,
      error: {
        name: err.name,
        message: err.message,
        stack: err.stack,
      },
    });
  }

  next(err);
}
