const { sql, poolPromise } = require('../config/db');

// Obtener todas las publicaciones (con filtros opcionales)
exports.getAll = async (req, res) => {
    try {
        const { search, category, condition, sort, min_price, max_price } = req.query;
        let queryStr = `
            SELECT p.*, c.name as category_name, u.name as seller_name, u.phone as seller_phone
            FROM products p
            JOIN categories c ON p.category_id = c.id
            JOIN users u ON p.user_id = u.id
            WHERE p.status = 'activo'
        `;

        const pool = await poolPromise;
        const request = pool.request();

        if (search) {
            queryStr += ' AND (p.title LIKE @search OR p.description LIKE @search)';
            request.input('search', sql.NVarChar, `%${search}%`);
        }

        if (category && category !== 'all') {
            queryStr += ' AND c.slug = @category';
            request.input('category', sql.NVarChar, category);
        }

        if (condition) {
            queryStr += ' AND p.condition_status = @condition';
            request.input('condition', sql.NVarChar, condition);
        }

        if (min_price) {
            queryStr += ' AND p.price >= @min_price';
            request.input('min_price', sql.Decimal(10, 2), min_price);
        }

        if (max_price) {
            queryStr += ' AND p.price <= @max_price';
            request.input('max_price', sql.Decimal(10, 2), max_price);
        }

        // Ordenamiento
        if (sort === 'price_asc') {
            queryStr += ' ORDER BY p.price ASC';
        } else if (sort === 'price_desc') {
            queryStr += ' ORDER BY p.price DESC';
        } else {
            queryStr += ' ORDER BY p.created_at DESC';
        }

        const result = await request.query(queryStr);
        res.json(result.recordset);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener publicaciones' });
    }
};

// Obtener detalles de una publicación
exports.getById = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`
                SELECT p.*, c.name as category_name, c.slug as category_slug, 
                       u.name as seller_name, u.phone as seller_phone 
                FROM products p
                JOIN categories c ON p.category_id = c.id
                JOIN users u ON p.user_id = u.id
                WHERE p.id = @id
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Publicación no encontrada' });
        }

        res.json(result.recordset[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener detalles del producto' });
    }
};

// Crear nueva publicación
exports.create = async (req, res) => {
    try {
        const { title, category_id, description, price, condition_status, image_url } = req.body;
        const user_id = req.user.id; // Viene del token JWT

        if (!title || !category_id || !description || !price || !condition_status) {
            return res.status(400).json({ error: 'Faltan campos obligatorios' });
        }

        const pool = await poolPromise;
        const result = await pool.request()
            .input('user_id', sql.Int, user_id)
            .input('category_id', sql.Int, category_id)
            .input('title', sql.NVarChar, title)
            .input('description', sql.NVarChar, description)
            .input('price', sql.Decimal(10, 2), price)
            .input('condition_status', sql.NVarChar, condition_status)
            .input('image_url', sql.NVarChar, image_url || null)
            .query(`
                INSERT INTO products 
                (user_id, category_id, title, description, price, condition_status, image_url, status) 
                OUTPUT inserted.id
                VALUES (@user_id, @category_id, @title, @description, @price, @condition_status, @image_url, 'activo')
            `);

        res.status(201).json({
            message: 'Publicación creada exitosamente',
            productId: result.recordset[0].id
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
        const pool = await poolPromise;
        const result = await pool.request()
            .input('slug', sql.NVarChar, slug)
            .query(`
                SELECT p.*, c.name as category_name, u.name as seller_name 
                FROM products p
                JOIN categories c ON p.category_id = c.id
                JOIN users u ON p.user_id = u.id
                WHERE p.status = 'activo' AND c.slug = @slug
                ORDER BY p.created_at DESC
            `);

        res.json(result.recordset);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener productos por categoría' });
    }
};

// Obtener mis publicaciones
exports.getMine = async (req, res) => {
    try {
        const user_id = req.user.id;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('user_id', sql.Int, user_id)
            .query(`
                SELECT p.*, c.name as category_name
                FROM products p
                JOIN categories c ON p.category_id = c.id
                WHERE p.user_id = @user_id AND p.status = 'activo'
                ORDER BY p.created_at DESC
            `);
        res.json(result.recordset);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener tus publicaciones' });
    }
};

// Actualizar publicación (titulo, precio y descripcion)
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, price, description } = req.body;
        const user_id = req.user.id;
        const role = req.user.role;

        const pool = await poolPromise;

        // Verificar existencia y propiedad
        const check = await pool.request().input('id', sql.Int, id).query('SELECT user_id FROM products WHERE id = @id');
        if (check.recordset.length === 0) return res.status(404).json({ error: 'Publicación no encontrada' });

        if (check.recordset[0].user_id !== user_id && role !== 'admin') {
            return res.status(403).json({ error: 'No tienes permiso para editar esta publicación' });
        }

        await pool.request()
            .input('id', sql.Int, id)
            .input('title', sql.NVarChar, title || null)
            .input('price', sql.Decimal(10, 2), price)
            .input('description', sql.NVarChar, description)
            .query('UPDATE products SET title = COALESCE(@title, title), price = @price, description = @description WHERE id = @id');

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

        const pool = await poolPromise;

        const check = await pool.request().input('id', sql.Int, id).query('SELECT user_id FROM products WHERE id = @id');
        if (check.recordset.length === 0) return res.status(404).json({ error: 'Publicación no encontrada' });

        if (check.recordset[0].user_id !== user_id && role !== 'admin') {
            return res.status(403).json({ error: 'No tienes permiso para eliminar esta publicación' });
        }

        // Eliminación física o lógica (marcaremos como inactivo para no perder historial, o borramos físicamente)
        // Optamos por borrar físicamente para este prototipo
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM products WHERE id = @id');

        res.json({ message: 'Publicación eliminada correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar publicación' });
    }
};
