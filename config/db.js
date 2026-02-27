const sql = require('mssql/msnodesqlv8');
require('dotenv').config();

const config = {
    server: process.env.DB_SERVER || 'localhost\\SQLEXPRESS',
    database: process.env.DB_NAME || 'marketplace_db',
    driver: 'msnodesqlv8',
    options: {
        trustedConnection: true, // Esto habilita la Autenticación de Windows
        encrypt: false, // suele ser falso en local 
        trustServerCertificate: true
    }
};

const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('✅ Conectado a SQL Server (Autenticación de Windows)');
        return pool;
    })
    .catch(err => {
        console.error('❌ Error al conectar a SQL Server:', err.message);
        console.error('👉 Asegúrate de que tu instancia de SQL Server esté corriendo y configurada.');
        process.exit(1);
    });

module.exports = {
    sql,
    poolPromise
};
