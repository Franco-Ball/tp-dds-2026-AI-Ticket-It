import "dotenv/config";
import app from "./src/app.js";
import { cargarSeeds } from "./src/seeds/seedData.js";

const PORT = process.env.SERVER_PORT || 8000;

const start = async () => {
  await cargarSeeds();

  app.listen(PORT, () => {
    console.log(`🚀 Backend de AI Ticket It escuchando en puerto ${PORT}`);
    console.log(`📖 Documentación Swagger interactiva: http://localhost:${PORT}/api-docs`);
  });
};

start();
