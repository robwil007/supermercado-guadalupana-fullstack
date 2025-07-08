import type { MedusaRequest, MedusaResponse } from "@medusajs/medusa";
import { MedusaError } from "@medusajs/utils";
import SeedService from "src/services/seed"; // Medusa resolverá esta ruta

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const seedService: SeedService = req.scope.resolve("seedService");
  const { secret } = req.query;

  const BATCH_SIZE = 100;

  if (secret !== process.env.SEED_SECRET) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Secret is incorrect"
    );
  }

  try {
    await seedService.seed(req.scope, BATCH_SIZE);
    res.status(200).json({ message: "Database seeded successfully!" });
  } catch (err) {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      `Seeding failed: ${err.message}`
    );
  }
}