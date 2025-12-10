const express = require('express');
const { signup, login, logout, getCurrentUser, verifyEmail, googleLogin } = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/verify', verifyEmail);
router.post('/logout', logout);
router.get('/me', authMiddleware, getCurrentUser);

module.exports = router;
