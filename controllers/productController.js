const { pool } = require('../config/db-mysql');

// Obtener todas las publicaciones (con filtros opcionales)
exports.getAll = async (req, res) => {
    try {
        const { search, category, condition, sort, min_price, max_price } = req.query;
        let queryStr = `
            SELECT p.*, c.name as category_name, u.name as seller_name, u.phone as seller_phone, u.location as user_location
            FROM products p
            JOIN categories c ON p.category_id = c.id
            JOIN users u ON p.user_id = u.id
            WHERE p.status = 'activo'
        `;
        let queryParams = [];

        if (search) {
            queryStr += ' AND (p.title LIKE ? OR p.description LIKE ?)';
            queryParams.push(`%${search}%`, `%${search}%`);
        }

        if (category && category !== 'all') {
            queryStr += ' AND c.slug = ?';
            queryParams.push(category);
        }

        if (condition) {
            queryStr += ' AND p.condition_status = ?';
            queryParams.push(condition);
        }

        if (min_price) {
            queryStr += ' AND p.price >= ?';
            queryParams.push(min_price);
        }

        if (max_price) {
            queryStr += ' AND p.price <= ?';
            queryParams.push(max_price);
        }

        // Ordenamiento
        if (sort === 'price_asc') {
            queryStr += ' ORDER BY p.price ASC';
        } else if (sort === 'price_desc') {
            queryStr += ' ORDER BY p.price DESC';
        } else {
            queryStr += ' ORDER BY p.created_at DESC';
        }

        const [result] = await pool.query(queryStr, queryParams);
        res.json(result);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener publicaciones' });
    }
};

// Obtener detalles de una publicación
exports.getById = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query(`
            SELECT p.*, c.name as category_name, c.slug as category_slug, 
                   u.name as seller_name, u.phone as seller_phone, u.location as user_location,
                   (SELECT CAST(ROUND(AVG(rating), 1) AS DECIMAL(2,1)) FROM user_reviews WHERE rated_user_id = u.id) as seller_rating,
                   (SELECT COUNT(*) FROM user_reviews WHERE rated_user_id = u.id) as seller_reviews_count
            FROM products p
            JOIN categories c ON p.category_id = c.id
            JOIN users u ON p.user_id = u.id
            WHERE p.id = ?
        `, [id]);

        if (result.length === 0) {
            return res.status(404).json({ error: 'Publicación no encontrada' });
        }

        res.json(result[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener detalles del producto' });
    }
};

// Crear nueva publicación
exports.create = async (req, res) => {
    try {
        const { title, category_id, description, price, condition_status, image_url, additional_images, location_type, location_custom } = req.body;
        const user_id = req.user.id; // Viene del token JWT

        if (!title || !category_id || !description || !price || !condition_status) {
            return res.status(400).json({ error: 'Faltan campos obligatorios' });
        }

        const [result] = await pool.query(`
            INSERT INTO products 
            (user_id, category_id, title, description, price, condition_status, image_url, additional_images, status, location_type, location_custom) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'activo', ?, ?)
        `, [
            user_id, category_id, title, description, price, condition_status,
            image_url || null, additional_images || null, location_type || 'acordado', location_custom || null
        ]);

        res.status(201).json({
            message: 'Publicación creada exitosamente',
            productId: result.insertId
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear la publicación' });
    }
};

// Obtener por categoria
exports.getByCategory = async (req, res) => {
    try {
        const { slug } = req.params;
        const [result] = await pool.query(`
            SELECT p.*, c.name as category_name, u.name as seller_name, u.location as user_location 
            FROM products p
            JOIN categories c ON p.category_id = c.id
            JOIN users u ON p.user_id = u.id
            WHERE p.status = 'activo' AND c.slug = ?
            ORDER BY p.created_at DESC
        `, [slug]);

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener productos por categoría' });
    }
};

// Obtener mis publicaciones
exports.getMine = async (req, res) => {
    try {
        const user_id = req.user.id;
        const [result] = await pool.query(`
            SELECT p.*, c.name as category_name
            FROM products p
            JOIN categories c ON p.category_id = c.id
            WHERE p.user_id = ? AND p.status = 'activo'
            ORDER BY p.created_at DESC
        `, [user_id]);
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener tus publicaciones' });
    }
};

// Actualizar publicación (titulo, precio y descripcion)
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, price, description, location_type, location_custom } = req.body;
        const user_id = req.user.id;
        const role = req.user.role;

        // Verificar existencia y propiedad
        const [check] = await pool.query('SELECT user_id FROM products WHERE id = ?', [id]);
        if (check.length === 0) return res.status(404).json({ error: 'Publicación no encontrada' });

        if (check[0].user_id !== user_id && role !== 'admin') {
            return res.status(403).json({ error: 'No tienes permiso para editar esta publicación' });
        }

        await pool.query(`
            UPDATE products 
            SET title = COALESCE(?, title), 
                price = ?, 
                description = ?,
                location_type = COALESCE(?, location_type),
                location_custom = ?
            WHERE id = ?
        `, [title || null, price, description, location_type || null, location_custom || null, id]);

        res.json({ message: 'Publicación actualizada correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar publicación' });
    }
};

// Eliminar (o desactivar) publicación
exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;
        const role = req.user.role;

        const [check] = await pool.query('SELECT user_id FROM products WHERE id = ?', [id]);
        if (check.length === 0) return res.status(404).json({ error: 'Publicación no encontrada' });

        if (check[0].user_id !== user_id && role !== 'admin') {
            return res.status(403).json({ error: 'No tienes permiso para eliminar esta publicación' });
        }

        await pool.query('DELETE FROM products WHERE id = ?', [id]);

        res.json({ message: 'Publicación eliminada correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar publicación' });
    }
};

// Obtener otras publicaciones del mismo vendedor (hasta 4)
exports.getMoreFromUser = async (req, res) => {
    try {
        const { userId, currentProductId } = req.params;

        const [result] = await pool.query(`
            SELECT p.id, p.title, p.price, p.image_url, p.condition_status, c.name as category_name
            FROM products p
            JOIN categories c ON p.category_id = c.id
            WHERE p.user_id = ? 
              AND p.id != ? 
              AND p.status = 'activo'
            ORDER BY RAND() 
            LIMIT 4
        `, [userId, currentProductId]);

        res.json(result);
    } catch (error) {
        console.error("Error al obtener más publicaciones:", error);
        res.status(500).json({ error: 'Hubo un problema al buscar otras publicaciones' });
    }
};
