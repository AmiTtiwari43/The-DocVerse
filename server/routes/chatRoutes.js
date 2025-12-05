const express = require('express');
const { getMockAIResponse } = require('../controllers/chatController');

const router = express.Router();

router.post('/', getMockAIResponse);

module.exports = router;
