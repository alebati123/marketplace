const { sql, poolPromise } = require('./config/db');
require('dotenv').config();

async function migrateFavorites() {
    try {
        const pool = await poolPromise;

        console.log('Creando tabla user_favorites...');
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='user_favorites' AND xtype='U')
            BEGIN
                CREATE TABLE user_favorites (
                    user_id INT NOT NULL,
                    product_id INT NOT NULL,
                    created_at DATETIME DEFAULT GETDATE(),
                    PRIMARY KEY (user_id, product_id),
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE NO ACTION,
                    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
                )
            END
        `);
        console.log('Tabla user_favorites creada/verificada.');

        process.exit(0);
    } catch (error) {
        console.error('Error migrando favoritos:', error);
        process.exit(1);
    }
}

migrateFavorites();
