const { pool } = require('./config/db-mysql');

async function setAdmin() {
    try {
        const [result] = await pool.query('UPDATE users SET role = "admin" WHERE email = "lambertuccimarketplace@gmail.com"');
        console.log(`Filas actualizadas: ${result.affectedRows}. ¡Usuario configurado como admin!`);
        process.exit(0);
    } catch (err) {
        console.error('Error al configurar admin:', err);
        process.exit(1);
    }
}

setAdmin();
