const { pool } = require('./config/db-mysql');

async function fixDatabase() {
    try {
        console.log('Aplicando correcciones a la base de datos...');

        // Añadir columnas faltantes a products si no existen
        try {
            await pool.query('ALTER TABLE products ADD COLUMN additional_images TEXT NULL');
            console.log('-> added additional_images to products');
        } catch (e) {
            console.log('info: additional_images already exists or error', e.message);
        }

        try {
            await pool.query('ALTER TABLE products ADD COLUMN location_type VARCHAR(50) DEFAULT "acordado"');
            console.log('-> added location_type to products');
        } catch (e) {
            console.log('info: location_type already exists or error', e.message);
        }

        try {
            await pool.query('ALTER TABLE products ADD COLUMN location_custom VARCHAR(255) NULL');
            console.log('-> added location_custom to products');
        } catch (e) {
            console.log('info: location_custom already exists or error', e.message);
        }

        // Añadir location a users
        try {
            await pool.query('ALTER TABLE users ADD COLUMN location VARCHAR(255) NULL');
            console.log('-> added location to users');
        } catch (e) {
            console.log('info: location already exists or error', e.message);
        }

        // Corregir codificación de categorías (fuerza UTF-8 por Node)
        await pool.query('DELETE FROM categories');
        await pool.query('ALTER TABLE categories AUTO_INCREMENT = 1');

        await pool.query(`
            INSERT IGNORE INTO categories (name, slug) VALUES 
            ('Electrónica', 'electronica'),
            ('Hogar', 'hogar'),
            ('Vehículos', 'vehiculos'),
            ('Ropa', 'ropa'),
            ('Deportes', 'deportes'),
            ('Muebles', 'muebles'),
            ('Herramientas', 'herramientas'),
            ('Otros', 'otros')
        `);
        console.log('-> Categories re-inserted successfully with correct UTF-8 encoding');

        console.log('CORRECCIONES APLICADAS EXITOSAMENTE!');
        process.exit(0);
    } catch (err) {
        console.error('Error fatal arreglando BD:', err);
        process.exit(1);
    }
}

fixDatabase();
