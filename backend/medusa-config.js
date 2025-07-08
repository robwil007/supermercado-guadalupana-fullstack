/** @type {import('@medusajs/medusa').ConfigModule} */
module.exports = {
  projectConfig: {
    database_url: process.env.DATABASE_URL,
    database_type: "postgres",

    database_extra: {
      ssl: {
        rejectUnauthorized: false,
      },
    },

    store_cors: "https://guadalupana-frontend.vercel.app",
    admin_cors: "https://guadalupana-frontend.vercel.app",

    // Secreto para proteger el endpoint de siembra
    seed_secret: process.env.SEED_SECRET,
  },
  plugins: [],
};