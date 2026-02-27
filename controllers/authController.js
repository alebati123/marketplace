const { sql, poolPromise } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendVerificationEmail } = require('../utils/mailer');

// Controlador para Registro
exports.register = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        // Validaciones básicas
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Nombre, email y constraseña son obligatorios' });
        }

        const pool = await poolPromise;

        // Verificar si el correo ya existe
        const existingUsers = await pool.request()
            .input('email', sql.NVarChar, email)
            .query('SELECT id FROM users WHERE email = @email');

        if (existingUsers.recordset.length > 0) {
            return res.status(400).json({ error: 'El email ya está en uso' });
        }

        // Hashear la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generar token de verificación
        const verificationToken = crypto.randomBytes(32).toString('hex');

        // Insertar usuario
        const result = await pool.request()
            .input('name', sql.NVarChar, name)
            .input('email', sql.NVarChar, email)
            .input('password', sql.NVarChar, hashedPassword)
            .input('phone', sql.NVarChar, phone || null)
            .input('vToken', sql.NVarChar, verificationToken)
            .query(`
                INSERT INTO users (name, email, password, phone, verification_token) 
                OUTPUT inserted.id
                VALUES (@name, @email, @password, @phone, @vToken)
            `);

        // Enviar correo de verificación
        try {
            await sendVerificationEmail(email, verificationToken);
        } catch (err) {
            console.error('No se pudo enviar correo, pero el usuario se registró', err);
        }

        res.status(201).json({
            message: 'Usuario registrado. Por favor verifica tu correo.',
            userId: result.recordset[0].id
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor al registrar' });
    }
};

// Controlador para Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
        }

        const pool = await poolPromise;

        // Buscar al usuario
        const result = await pool.request()
            .input('email', sql.NVarChar, email)
            .query('SELECT * FROM users WHERE email = @email');

        if (result.recordset.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const user = result.recordset[0];

        // Verificar si la cuenta fue validada por correo
        if (!user.is_verified) {
            return res.status(403).json({ error: 'Debes revisar tu correo electrónico y verificar la cuenta antes de iniciar sesión.' });
        }

        // Validar contraseña
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Generar Token JWT
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, name: user.name },
            process.env.JWT_SECRET || 'secret_fallback_123',
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login exitoso',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor al iniciar sesión' });
    }
};

// Controlador para Verificar Cuenta (Por GET link en correo)
exports.verify = async (req, res) => {
    try {
        const { token } = req.params;
        const pool = await poolPromise;

        const result = await pool.request()
            .input('token', sql.NVarChar, token)
            .query('SELECT id FROM users WHERE verification_token = @token AND is_verified = 0');

        if (result.recordset.length === 0) {
            return res.status(400).send('<div style="font-family:sans-serif; text-align:center; padding:50px;"><h2>El enlace de verificación es inválido o la cuenta ya fue verificada.</h2></div>');
        }

        const userId = result.recordset[0].id;

        await pool.request()
            .input('id', sql.Int, userId)
            .query('UPDATE users SET is_verified = 1, verification_token = NULL WHERE id = @id');

        res.send('<div style="font-family:sans-serif; text-align:center; padding:50px; background:#0b192c; color:white;"><h2>¡Cuenta verificada exitosamente!</h2><br><a href="/auth.html" style="background:#ff6b6b; color:white; padding:10px 20px; text-decoration:none; border-radius:10px;">Ya puedes iniciar sesión</a></div>');
    } catch (error) {
        console.error(error);
        res.status(500).send('<div style="font-family:sans-serif; text-align:center; padding:50px;"><h2>Error interno del servidor</h2></div>');
    }
};

// Controlador para obtener todos los usuarios (Solo Admin)
exports.getAllUsers = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Acceso denegado. Solo administradores pueden ver los usuarios.' });
        }

        const pool = await poolPromise;

        // Seleccionamos datos básicos de todos los usuarios
        const result = await pool.request()
            .query('SELECT id, name, email, role, phone, created_at FROM users ORDER BY created_at DESC');

        res.json(result.recordset);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor al obtener usuarios' });
    }
};
