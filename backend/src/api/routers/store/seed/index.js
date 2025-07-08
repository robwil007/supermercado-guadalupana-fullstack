const fs = require("fs");
const path = require("path");

module.exports = (router) => {
  router.get("/store/seed", async (req, res) => {
    const { secret } = req.query;
    
    // 1. Proteger el endpoint
    if (secret !== process.env.SEED_SECRET) {
      return res.status(401).json({ message: "Unauthorized: Invalid secret" });
    }

    try {
      const productCollectionService = req.scope.resolve("productCollectionService");
      const productService = req.scope.resolve("productService");
      const manager = req.scope.resolve("manager");

      // Leer los datos del archivo seed.json
      const seedFilePath = path.join(process.cwd(), "data", "seed.json");
      const seedData = JSON.parse(fs.readFileSync(seedFilePath, "utf-8"));

      // 2. Crear las Colecciones (Categorías)
      const createdCollections = {};
      for (const collection of seedData.collections) {
        let existing = await productCollectionService.retrieveByHandle(collection.id).catch(() => undefined);
        if (!existing) {
          existing = await productCollectionService.create({
            title: collection.title,
            handle: collection.id,
          });
        }
        createdCollections[collection.id] = existing;
      }

      // 3. Crear los Productos
      for (const product of seedData.products) {
        const collection = createdCollections[product.collection_id];
        if (!collection) {
          console.warn(`Collection not found for product: ${product.title}`);
          continue;
        }
        
        // Evitar duplicados
        let existingProduct = await productService.retrieve(product.id).catch(() => undefined);
        if(existingProduct) {
            continue; // Si el producto ya existe, lo saltamos.
        }

        const productData = {
          id: product.id,
          title: product.title,
          description: product.description,
          images: product.images,
          collection_id: collection.id,
          variants: product.variants.map(v => ({
            title: v.title,
            prices: v.prices,
            inventory_quantity: v.inventory_quantity
          })),
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