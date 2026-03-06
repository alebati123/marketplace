const { pool } = require('../config/db-mysql');

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

        // Verificar si ya le dejó reseña antes
        const [existing] = await pool.query('SELECT id FROM user_reviews WHERE reviewer_id = ? AND rated_user_id = ?', [reviewer_id, rated_user_id]);

        if (existing.length > 0) {
            // Actualizar reseña existente
            await pool.query(`
                UPDATE user_reviews 
                SET rating = ?, comment = ? 
                WHERE id = ?
            `, [rating, comment || null, existing[0].id]);
            return res.json({ message: 'Calificación actualizada exitosamente' });
        }

        // Insertar nueva reseña
        await pool.query(`
            INSERT INTO user_reviews (reviewer_id, rated_user_id, rating, comment)
            VALUES (?, ?, ?, ?)
        `, [reviewer_id, rated_user_id, rating, comment || null]);

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

        const [result] = await pool.query(`
            SELECT r.id, r.rating, r.comment, r.created_at,
                   u1.name as reviewer_name, u1.email as reviewer_email, 
                   u2.name as rated_user_name, u2.email as rated_user_email
            FROM user_reviews r
            JOIN users u1 ON r.reviewer_id = u1.id
            JOIN users u2 ON r.rated_user_id = u2.id
            ORDER BY r.created_at DESC
        `);

        res.json(result);
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

        const [result] = await pool.query('DELETE FROM user_reviews WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Reseña no encontrada' });
        }

        res.json({ message: 'Reseña eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar reseña:', error);
        res.status(500).json({ error: 'Hubo un error al eliminar la reseña' });
    }
};

// ==========================================
// USER PROFILE MANAGEMENT
// ==========================================

// Obtener detalles del perfil del usuario (nombre, email, telefono, etc)
exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const [result] = await pool.query('SELECT name, email, phone, role, created_at FROM users WHERE id = ?', [userId]);

        if (result.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json(result[0]);
    } catch (error) {
        console.error('Error obteniendo perfil:', error);
        res.status(500).json({ error: 'Error del servidor al obtener el perfil.' });
    }
};

// Actualizar perfil (principalmente telefono y nombre)
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, phone } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'El nombre es obligatorio.' });
        }

        await pool.query('UPDATE users SET name = ?, phone = ? WHERE id = ?', [name, phone || null, userId]);

        res.json({ message: 'Perfil actualizado exitosamente.' });
    } catch (error) {
        console.error('Error actualizando perfil:', error);
        res.status(500).json({ error: 'Error agregando el teléfono o actualizando el perfil.' });
    }
};
