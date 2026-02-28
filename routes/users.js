const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

router.post('/:rated_user_id/rate', authMiddleware, userController.rateUser);

// User Profile
router.get('/profile', authMiddleware, userController.getProfile);
router.put('/profile', authMiddleware, userController.updateProfile);

// Admin
router.get('/reviews', authMiddleware, userController.getAllReviews);
router.delete('/reviews/:id', authMiddleware, userController.deleteReview);

module.exports = router;
