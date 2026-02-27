const { poolPromise } = require('./config/db');

async function testInsert() {
    try {
        const pool = await poolPromise;
        const res = await pool.request().query("SELECT name, is_identity FROM sys.columns WHERE object_id = object_id('users') AND name = 'id'");
        console.log("Is identity:", res.recordset[0]);

        // try to insert
        await pool.request().query(`INSERT INTO users (name, email, password, phone) OUTPUT inserted.id VALUES ('TestUser', 'testusr@email.com', 'testpwd', '1234')`);
        console.log("Insert success!");
    } catch (err) {
        console.error("Insert error details:", err.message);
    } finally {
        process.exit();
    }
}
testInsert();
