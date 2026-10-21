import "dotenv/config";
import express from "express";
import cors from "cors";
import router from "./routes/router.js";
import { notFoundHandler } from "./middlewares/notFoundHandler.js";
import { errorLogger } from "./middlewares/errorLogger.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: (origin, callback) => {
      // Permitir peticiones sin origin (como apps móviles nativas de Expo Go, curl, Postman)
      if (!origin) return callback(null, true);
      const allowed = process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
        : [];
      if (
        allowed.includes(origin) ||
        origin.startsWith("http://localhost:") ||
        origin.startsWith("http://127.0.0.1:") ||
        origin.startsWith("http://192.168.") ||
        origin.startsWith("exp://")
      ) {
        return callback(null, true);
      }
      return callback(null, true); // En desarrollo permitir todas
    },
    credentials: true,
  })
);


app.get("/hello", (req, res) => {
  res.json({ message: "hello world" });
});

app.use("/api", router);

// Middlewares de errores
app.use(notFoundHandler);
app.use(errorLogger);
app.use(errorHandler);

export default app;
