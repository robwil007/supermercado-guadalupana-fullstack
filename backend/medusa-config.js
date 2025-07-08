/** @type {import('@medusajs/medusa').ConfigModule} */
module.exports = {
  projectConfig: {
    // Para la base de datos de producción, Medusa debe leer la
    // URL de conexión desde una variable de entorno segura.
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
    // Se ha especificado la URL del frontend para mayor seguridad.
    store_cors: "https://guadalupana-frontend.vercel.app",
    admin_cors: "/.*/",
  },
  plugins: [],
};