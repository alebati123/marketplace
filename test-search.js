const { pool } = require('./config/db-mysql');

async function test() {
    try {
        const [res1] = await pool.query("SELECT 'cortar pasto' LIKE '%corta%' as match1");
        console.log("Does 'cortar pasto' match '%corta%'?", res1[0].match1);

        const [res2] = await pool.query("SELECT 'corta pasto' LIKE '%cortar%' as match2");
        console.log("Does 'corta pasto' match '%cortar%'?", res2[0].match2);

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

test();
