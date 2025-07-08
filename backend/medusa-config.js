/** @type {import('@medusajs/medusa').ConfigModule} */
module.exports = {
  projectConfig: {
    database_url: process.env.DATABASE_URL,
    database_type: "postgres",

    // Configuración SSL explícita para compatibilidad con Neon.tech
    // Esto soluciona el error ECONNRESET.
    database_extra: {
      ssl: {
        rejectUnauthorized: false,
      },
    },

    // Configuración de CORS para permitir que nuestro frontend se comunique con este backend.
    store_cors: "https://guadalupana-frontend.vercel.app",
    admin_cors: "https://guadalupana-frontend.vercel.app",
  },
  plugins: [],
};