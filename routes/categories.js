const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middleware/auth');

// Rutas Públicas
router.get('/', categoryController.getAll);

// Rutas Privadas (Requieren ser Admin, validado dentro del controller)
router.post('/', authMiddleware, categoryController.create);
router.delete('/:id', authMiddleware, categoryController.delete);

module.exports = router;
