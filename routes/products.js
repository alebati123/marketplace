const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/auth');

// Rutas Públicas
router.get('/', productController.getAll);
router.get('/category/:slug', productController.getByCategory);

// Rutas Privadas (Requieren estar logueado)
router.get('/user/me', authMiddleware, productController.getMine);
router.post('/', authMiddleware, productController.create);
router.put('/:id', authMiddleware, productController.update);
router.delete('/:id', authMiddleware, productController.delete);

// Opcional o públicas sin auth
router.get('/user/:userId/other/:currentProductId', productController.getMoreFromUser);

// Este debe ir al final para no atrapar otras rutas
router.get('/:id', productController.getById);

module.exports = router;
