const mysql = require('mysql2/promise');
require('dotenv').config();

let pool;

if (process.env.DB_URI) {
    // Para bases de datos en la nube (TiDB, Aiven, Render)
    const dbConfig = { uri: process.env.DB_URI };
    if (process.env.DB_SSL === 'true') {
        dbConfig.ssl = {
            rejectUnauthorized: true,
            minVersion: 'TLSv1.2'
        };
    }
    pool = mysql.createPool(dbConfig);
} else {
    // Para local (u otros)
    pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'marketplace_db',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : undefined
    });
}

// Test the connection
pool.getConnection()
    .then(connection => {
        console.log('✅ Conectado a MySQL exitosamente');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Error al conectar a MySQL:', err.message);
        console.error('👉 Asegúrate de que XAMPP / MySQL esté corriendo y la base de datos exista.');
    });

module.exports = {
    pool
};
