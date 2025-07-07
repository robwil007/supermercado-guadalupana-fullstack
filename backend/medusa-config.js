
/** @type {import('@medusajs/medusa').ConfigModule} */
module.exports = {
  projectConfig: {
    // Para la base de datos de producción, Medusa debe leer la
    // URL de conexión desde una variable de entorno segura.
    database_url: process.env.DATABASE_URL,
    database_type: "postgres",

    // Configuración de CORS para permitir que nuestro frontend se comunique con este backend.
    // En un futuro, cambiaremos "/.*/" por la URL específica de nuestro frontend para mayor seguridad.
    store_cors: "/.*/",
    admin_cors: "/.*/",
  },
  plugins: [],
};
