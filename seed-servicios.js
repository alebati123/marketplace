require('dotenv').config();
const sql = require('mssql');

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};

async function seedCategory() {
    try {
        await sql.connect(dbConfig);
        console.log("Conectado a la base de datos.");

        const checkQuery = await sql.query("SELECT id FROM categories WHERE slug = 'servicios'");

        if (checkQuery.recordset.length === 0) {
            console.log("La categoría 'Servicios' no existe. Creándola...");
            await sql.query("INSERT INTO categories (name, slug) VALUES ('Servicios Profesionales', 'servicios')");
            console.log("Categoría creada exitosamente.");
        } else {
            console.log("La categoría 'Servicios' ya existe. Omitiendo...");
        }

    } catch (err) {
        console.error("Error durante la migración:", err);
    } finally {
        await sql.close();
    }
}

seedCategory();
