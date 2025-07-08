const { Router } = require("express");
const cors = require("cors");
const attachSeedRoutes = require("./routes/store/seed");

module.exports = (rootDirectory, options) => {
  const router = Router();
  
  const { store_cors } = options.projectConfig;
  const corsOptions = {
    origin: store_cors.split(","),
    credentials: true,
  };
  
  // Registrar las rutas de siembra
  attachSeedRoutes(router, corsOptions);

  return router;
};