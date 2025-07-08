module.exports = (router) => {
  router.get("/store/seed", async (req, res) => {
    const { secret } = req.query;
    
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