const { poolPromise } = require('./config/db');

async function check() {
    try {
        const pool = await poolPromise;
        const res = await pool.request().query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'");
        console.log("--- TABLAS ---");
        console.log(res.recordset);

        const users = await pool.request().query("SELECT COLUMN_NAME, IS_NULLABLE, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users'");
        console.log("\n--- COLUMNAS EN 'users' ---");
        console.log(users.recordset);

    } catch (err) {
        console.error("ERROR DB:", err);
    } finally {
        process.exit();
    }
}

check();
