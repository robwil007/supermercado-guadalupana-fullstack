// backend/src/api/routes/store/seed/index.js
const fs = require("fs");
const path = require("path");

exports.default = (router) => {
  router.get("/store/seed", async (req, res) => {
    const { secret } = req.query;
    
    // 1. Proteger el endpoint
    if (secret !== process.env.SEED_SECRET) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const productCollectionService = req.scope.resolve("productCollectionService");
      const productService = req.scope.resolve("productService");
      const manager = req.scope.resolve("manager");

      // Leer los datos del archivo seed.json
      const seedFilePath = path.join(__dirname, "../../../../../data/seed.json");
      const seedData = JSON.parse(fs.readFileSync(seedFilePath, "utf-8"));

      // 2. Crear las Colecciones (Categorías)
      const createdCollections = {};
      for (const collection of seedData.collections) {
        const newCollection = await productCollectionService.create({
          title: collection.title,
          handle: collection.id,
        });
        createdCollections[collection.id] = newCollection;
      }

      // 3. Crear los Productos
      for (const product of seedData.products) {
        const collection = createdCollections[product.collection_id];
        if (!collection) {
          console.warn(`Collection not found for product: ${product.title}`);
          continue;
        }

        const productData = {
          title: product.title,
          description: product.description,
          images: product.images,
          collection_id: collection.id,
          variants: product.variants.map(v => ({
            title: v.title,
            prices: v.prices,
            inventory_quantity: v.inventory_quantity
          })),
          // Habilitar el producto para que sea visible en la tienda
          status: "published",
        };
        await manager.transaction(async (transactionManager) => {
          await productService.withTransaction(transactionManager).create(productData);
        });
      }

      res.status(200).json({ message: "Database seeded successfully!" });

    } catch (err) {
      console.error("Seeding failed:", err);
      res.status(500).json({ message: "Seeding failed", error: err.message });
    }
  });
};