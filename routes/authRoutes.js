// routes/authRoutes.js
const express = require('express');
const AuthController = require('../controllers/authController');
const authenticateToken = require('../middlewares/authMiddleware');

const router = express.Router();

// Register a new user
router.post('/register', AuthController.register);

// Login and generate a JWT
router.post('/login', AuthController.login);

// Protected route
router.get('/protected', authenticateToken, AuthController.getProtectedData);

module.exports = router;