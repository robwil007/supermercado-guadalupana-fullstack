const cors = require("cors");

module.exports = (router, corsOptions) => {
  // Configurar CORS para esta ruta específica
  router.get("/store/seed", cors(corsOptions), async (req, res) => {
    const { secret } = req.query;
    
    // 1. Proteger el endpoint
    if (secret !== process.env.SEED_SECRET) {
      return res.status(401).json({ message: "Unauthorized: Invalid secret" });
    }

    try {
      const seedService = req.scope.resolve("seedService");
      await seedService.seed();
      res.status(200).json({ message: "Database seeded successfully!" });
    } catch (err) {
      console.error("Seeding failed:", err);
      res.status(500).json({ message: "Seeding failed", error: err.message });
    }
  });
};