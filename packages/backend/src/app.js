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
    origin: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
      : true,
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
