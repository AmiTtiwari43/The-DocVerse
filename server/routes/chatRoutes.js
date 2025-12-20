const express = require('express');
const protect = require('../middleware/auth');
const { processChat, getChatHistory } = require('../controllers/chatController');

const router = express.Router();

router.use(protect); // All chat routes require authentication

router.post('/', processChat);
router.get('/history', getChatHistory);

module.exports = router;
