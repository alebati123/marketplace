const { pool } = require('../config/db-mysql');

// Obtener todas las categorías
exports.getAll = async (req, res) => {
    try {
        const [result] = await pool.query('SELECT * FROM categories ORDER BY name ASC');
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener categorías' });
    }
};

// Crear nueva categoría (Sólo admin)
exports.create = async (req, res) => {
    try {
        // Verificar rol admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Acceso denegado. Requiere privilegios de administrador.' });
        }

        const { name, slug } = req.body;
        if (!name || !slug) return res.status(400).json({ error: 'Nombre y slug son obligatorios' });

        const [result] = await pool.query('INSERT INTO categories (name, slug) VALUES (?, ?)', [name, slug]);

        res.status(201).json({ message: 'Categoría creada exitosamente', categoryId: result.insertId });
    } catch (error) {
        console.error(error);
        if (error.code === 'ER_DUP_ENTRY') { // Unique constraint en MySQL
            return res.status(400).json({ error: 'Ya existe una categoría con ese slug' });
        }
        res.status(500).json({ error: 'Error al crear categoría' });
    }
};

// Eliminar categoría (Sólo admin)
exports.delete = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Acceso denegado. Requiere privilegios de administrador.' });
        }

        const { id } = req.params;

        // Verificar si hay productos que usan esta categoría
        const [check] = await pool.query('SELECT COUNT(*) as count FROM products WHERE category_id = ?', [id]);

        if (check[0].count > 0) {
            return res.status(400).json({ error: 'No se puede eliminar la categoría porque hay productos que pertenecen a ella.' });
        }

        await pool.query('DELETE FROM categories WHERE id = ?', [id]);

        res.json({ message: 'Categoría eliminada exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar categoría' });
    }
};
