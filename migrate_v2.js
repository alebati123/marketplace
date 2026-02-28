const { sql, poolPromise } = require('./config/db');

async function migrate_v2() {
    try {
        const pool = await poolPromise;
        console.log("Conectado a la base de datos. Ejecutando migraciones V2...");

        // Añadir columna additional_images a products si no existe
        await pool.request().query(`
            IF COL_LENGTH('dbo.products', 'additional_images') IS NULL
            BEGIN
                ALTER TABLE products ADD additional_images NVARCHAR(MAX) NULL;
                PRINT 'Columna additional_images añadida a products.';
            END
            ELSE BEGIN
                PRINT 'Columna additional_images ya existe en products.';
            END
        `);

        // Crear tabla de Reseñas / Calificaciones de Vendedores
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[user_reviews]') AND type in (N'U'))
            BEGIN
                CREATE TABLE user_reviews (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    reviewer_id INT NOT NULL,
                    rated_user_id INT NOT NULL,
                    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
                    comment NVARCHAR(MAX) NULL,
                    created_at DATETIME DEFAULT GETDATE(),
                    CONSTRAINT FK_Reviews_Reviewer FOREIGN KEY (reviewer_id) REFERENCES users(id),
                    CONSTRAINT FK_Reviews_RatedUser FOREIGN KEY (rated_user_id) REFERENCES users(id)
                );
                PRINT 'Tabla user_reviews creada con éxito.';
            END
            ELSE BEGIN
                PRINT 'La tabla user_reviews ya existe.';
            END
        `);

        console.log("Migración V2 completada exitosamente.");
        process.exit(0);
    } catch (err) {
        console.error("Error durante la migración V2:", err);
        process.exit(1);
    }
}

migrate_v2();
