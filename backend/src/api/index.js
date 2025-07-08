// backend/src/api/index.js
const { Router } = require("express");
const seed = require("./routes/store/seed").default;

module.exports = (rootDirectory, options) => {
  const router = Router();

  // Registrar nuestras rutas personalizadas
  seed(router);

  return router;
}