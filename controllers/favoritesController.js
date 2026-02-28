const { sql, poolPromise } = require('../config/db');

// Obtener favoritos del usuario
exports.getFavorites = async (req, res) => {
    try {
        const userId = req.user.id;
        const pool = await poolPromise;

        const result = await pool.request()
            .input('userId', sql.Int, userId)
            .query(`
                SELECT p.*, c.name as category_name, u.name as seller_name, uf.created_at as saved_at
                FROM user_favorites uf
                JOIN products p ON uf.product_id = p.id
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN users u ON p.user_id = u.id
                WHERE uf.user_id = @userId
                ORDER BY uf.created_at DESC
            `);

        // Check if there are no results
        res.json(result.recordset);
    } catch (error) {
        console.error('Error obteniendo favoritos:', error);
        res.status(500).json({ error: 'Error del servidor al obtener favoritos.' });
    }
};

// Agregar un producto a favoritos
exports.addFavorite = async (req, res) => {
    try {
        const userId = req.user.id;
        const productId = req.params.productId;

        const pool = await poolPromise;

        // Verificar si ya es favorito
        const check = await pool.request()
            .input('userId', sql.Int, userId)
            .input('productId', sql.Int, productId)
            .query('SELECT * FROM user_favorites WHERE user_id = @userId AND product_id = @productId');

        if (check.recordset.length > 0) {
            return res.status(400).json({ message: 'El producto ya está en tus favoritos.' });
        }

        // Insertar
        await pool.request()
            .input('userId', sql.Int, userId)
            .input('productId', sql.Int, productId)
            .query('INSERT INTO user_favorites (user_id, product_id) VALUES (@userId, @productId)');

        res.status(201).json({ message: 'Agregado a favoritos.' });
    } catch (error) {
        console.error('Error agregando favorito:', error);
        res.status(500).json({ error: 'Error agregando a favoritos.' });
    }
};

// Eliminar un producto de favoritos
exports.removeFavorite = async (req, res) => {
    try {
        const userId = req.user.id;
        const productId = req.params.productId;

        const pool = await poolPromise;

        await pool.request()
            .input('userId', sql.Int, userId)
            .input('productId', sql.Int, productId)
            .query('DELETE FROM user_favorites WHERE user_id = @userId AND product_id = @productId');

        res.json({ message: 'Eliminado de favoritos.' });
    } catch (error) {
        console.error('Error eliminando favorito:', error);
        res.status(500).json({ error: 'Error eliminando favorito.' });
    }
};
