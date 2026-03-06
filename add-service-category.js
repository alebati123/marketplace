const { pool } = require('./config/db-mysql');

async function fixCategory() {
    try {
        await pool.query(`
            INSERT IGNORE INTO categories (name, slug) VALUES 
            ('Servicios', 'servicios')
        `);
        console.log('-> Category "Servicios" added successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

fixCategory();
