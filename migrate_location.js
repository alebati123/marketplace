const { sql, poolPromise } = require('./config/db');

async function migrate() {
    try {
        const pool = await poolPromise;
        console.log("Conectado a la base de datos. Ejecutando migraciones...");

        // Añadir columna location a users si no existe
        await pool.request().query(`
            IF COL_LENGTH('dbo.users', 'location') IS NULL
            BEGIN
                ALTER TABLE users ADD location NVARCHAR(255) NULL;
                PRINT 'Columna location añadida a users.';
            END
            ELSE BEGIN
                PRINT 'Columna location ya existe en users.';
            END
        `);

        // Añadir location_type a products si no existe
        await pool.request().query(`
            IF COL_LENGTH('dbo.products', 'location_type') IS NULL
            BEGIN
                ALTER TABLE products ADD location_type NVARCHAR(50) DEFAULT 'acordado';
                PRINT 'Columna location_type añadida a products.';
            END
            ELSE BEGIN
                PRINT 'Columna location_type ya existe en products.';
            END
        `);

        // Añadir location_custom a products si no existe
        await pool.request().query(`
            IF COL_LENGTH('dbo.products', 'location_custom') IS NULL
            BEGIN
                ALTER TABLE products ADD location_custom NVARCHAR(255) NULL;
                PRINT 'Columna location_custom añadida a products.';
            END
            ELSE BEGIN
                PRINT 'Columna location_custom ya existe en products.';
            END
        `);

        console.log("Migración completada exitosamente.");
        process.exit(0);
    } catch (err) {
        console.error("Error durante la migración:", err);
        process.exit(1);
    }
}

migrate();
