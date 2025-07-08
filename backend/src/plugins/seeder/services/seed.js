const { BaseService } = require("medusa-interfaces");
const fs = require("fs");
const path = require("path");

class SeedService extends BaseService {
  constructor({
    productCollectionService,
    productService,
    manager
  }, options) {
    super();
    this.productCollectionService_ = productCollectionService;
    this.productService_ = productService;
    this.manager_ = manager;
    this.options_ = options;
  }

  async seed() {
    // La ruta ahora es relativa al directorio raíz del proyecto
    const seedFilePath = path.join(process.cwd(), "data", "seed.json");
    if (!fs.existsSync(seedFilePath)) {
        throw new Error(`Seed file not found at: ${seedFilePath}`);
    }
    
    const seedData = JSON.parse(fs.readFileSync(seedFilePath, "utf-8"));

    const createdCollections = {};
    for (const collection of seedData.collections) {
      let existing = await this.productCollectionService_.retrieveByHandle(collection.id).catch(() => undefined);
      if (!existing) {
        existing = await this.productCollectionService_.create({
          title: collection.title,
          handle: collection.id,
        });
      }
      createdCollections[collection.id] = existing;
    }

    for (const product of seedData.products) {
      const collection = createdCollections[product.collection_id];
      if (!collection) {
        console.warn(`Collection not found for product: ${product.title}`);
        continue;
      }

      let existingProduct = await this.productService_.retrieve(product.id).catch(() => undefined);
      if (existingProduct) {
        continue;
      }

      const productData = {
        id: product.id,
        title: product.title,
        description: product.description,
        thumbnail: product.images[0], // Medusa usa thumbnail para la imagen principal
        images: product.images,
        collection_id: collection.id,
        variants: product.variants.map(v => ({
          title: v.title,
          prices: v.prices,
          inventory_quantity: v.inventory_quantity
        })),
        status: "published",
      };

      await this.manager_.transaction(async (transactionManager) => {
        await this.productService_.withTransaction(transactionManager).create(productData);
      });
    }
    return { success: true };
  }
}

module.exports = SeedService;