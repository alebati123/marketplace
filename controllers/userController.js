const { sql, poolPromise } = require('../config/db');

// Dejar una reseña/rating a un vendedor
exports.rateUser = async (req, res) => {
    try {
        const { rated_user_id } = req.params;
        const { rating, comment } = req.body;
        const reviewer_id = req.user.id; // Del token JWT

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'La calificación debe ser entre 1 y 5 estrellas' });
        }

        if (parseInt(rated_user_id) === reviewer_id) {
            return res.status(400).json({ error: 'No puedes calificarte a ti mismo' });
        }

        const pool = await poolPromise;

        // Verificar si ya le dejó reseña antes
        const existing = await pool.request()
            .input('reviewer_id', sql.Int, reviewer_id)
            .input('rated_user_id', sql.Int, rated_user_id)
            .query('SELECT id FROM user_reviews WHERE reviewer_id = @reviewer_id AND rated_user_id = @rated_user_id');

        if (existing.recordset.length > 0) {
            // Actualizar reseña existente
            await pool.request()
                .input('rating', sql.Int, rating)
                .input('comment', sql.NVarChar, comment || null)
                .input('id', sql.Int, existing.recordset[0].id)
                .query(`
                    UPDATE user_reviews 
                    SET rating = @rating, comment = @comment 
                    WHERE id = @id
                `);
            return res.json({ message: 'Calificación actualizada exitosamente' });
        }

        // Insertar nueva reseña
        await pool.request()
            .input('reviewer_id', sql.Int, reviewer_id)
            .input('rated_user_id', sql.Int, rated_user_id)
            .input('rating', sql.Int, rating)
            .input('comment', sql.NVarChar, comment || null)
            .query(`
                INSERT INTO user_reviews (reviewer_id, rated_user_id, rating, comment)
                VALUES (@reviewer_id, @rated_user_id, @rating, @comment)
            `);

        res.status(201).json({ message: '¡Gracias por calificar a este vendedor!' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al enviar la calificación' });
    }
};

// Obtener todas las reseñas (Para Admin)
exports.getAllReviews = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Acceso denegado' });
        }

        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT r.id, r.rating, r.comment, r.created_at,
                   u1.name as reviewer_name, u1.email as reviewer_email, 
                   u2.name as rated_user_name, u2.email as rated_user_email
            FROM user_reviews r
            JOIN users u1 ON r.reviewer_id = u1.id
            JOIN users u2 ON r.rated_user_id = u2.id
            ORDER BY r.created_at DESC
        `);

        res.json(result.recordset);
    } catch (error) {
        console.error('Error al obtener reseñas:', error);
        res.status(500).json({ error: 'Hubo un error al cargar las reseñas' });
    }
};

// Eliminar una reseña (Para Admin)
exports.deleteReview = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Acceso denegado' });
        }

        const { id } = req.params;
        const pool = await poolPromise;

        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM user_reviews WHERE id = @id');

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Reseña no encontrada' });
        }

        res.json({ message: 'Reseña eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar reseña:', error);
        res.status(500).json({ error: 'Hubo un error al eliminar la reseña' });
    }
};
