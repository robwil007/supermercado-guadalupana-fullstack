const { Router } = require("express");
const cors = require("cors");
const seedRoute = require("./routes/store/seed");

// Este archivo registra todas nuestras rutas de API personalizadas.
module.exports = (rootDirectory, options) => {
  const router = Router();
  
  // Habilitar CORS para la nueva ruta
  const { store_cors } = options.projectConfig;
  const corsOptions = {
    origin: store_cors.split(","),
    credentials: true,
  };
  router.use("/store/seed", cors(corsOptions));
  
  // Registrar la ruta de siembra
  seedRoute(router);

  return router;
};