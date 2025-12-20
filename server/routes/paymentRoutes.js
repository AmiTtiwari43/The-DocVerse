const express = require('express');
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// UPI QR Code Payment Routes
router.post('/upi/get-details', authMiddleware, paymentController.getUPIPaymentDetails);
router.post('/upi/confirm', authMiddleware, paymentController.confirmUPIPayment);
router.get('/history', authMiddleware, paymentController.getPaymentHistory);

module.exports = router;

