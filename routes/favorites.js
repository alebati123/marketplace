const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const favoritesController = require('../controllers/favoritesController');

// Todas estas rutas requieren estar logueado
router.use(authMiddleware);

// GET /api/favorites -> Devuelve los productos favoritos del usuario
router.get('/', favoritesController.getFavorites);

// POST /api/favorites/:productId -> Agrega un producto a favoritos
router.post('/:productId', favoritesController.addFavorite);

// DELETE /api/favorites/:productId -> Elimina un producto de favoritos
router.delete('/:productId', favoritesController.removeFavorite);

module.exports = router;
