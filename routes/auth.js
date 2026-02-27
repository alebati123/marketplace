const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

const authMiddleware = require('../middleware/auth');

// Ruta para registro de usuario
router.post('/register', authController.register);

// Ruta para inicio de sesión
router.post('/login', authController.login);

// Ruta para obtener todos los usuarios (solo administradores)
router.get('/users', authMiddleware, authController.getAllUsers);

// Ruta para verificar email
router.get('/verify/:token', authController.verify);

module.exports = router;
