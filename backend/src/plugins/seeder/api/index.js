const { Router } = require("express");
const cors = require("cors");
const seedRoute = require("./routes/store/seed");

module.exports = (rootDirectory, options) => {
  const router = Router();
  const { store_cors } = options.projectConfig;
  const corsOptions = {
    origin: store_cors.split(","),
    credentials: true,
  };
  router.use("/store/seed", cors(corsOptions));
  seedRoute(router);
  return router;
};