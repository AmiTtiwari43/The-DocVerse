const express = require('express');
const adminController = require('../controllers/adminController');
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Simple admin check middleware
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
}

// User and doctor management
router.get('/users', authMiddleware, requireAdmin, adminController.getAllUsers);
router.delete('/users/:id', authMiddleware, requireAdmin, adminController.deleteUser);
router.patch('/users/block/:id', authMiddleware, requireAdmin, adminController.blockUser);
router.patch('/users/unblock/:id', authMiddleware, requireAdmin, adminController.unblockUser);

// Doctor verification
router.get('/doctors/pending', authMiddleware, requireAdmin, adminController.getPendingDoctors);
router.patch('/doctors/verify/:id', authMiddleware, requireAdmin, adminController.verifyDoctor);
router.patch('/doctors/reject/:id', authMiddleware, requireAdmin, adminController.rejectDoctor);
router.patch('/doctors/unverify/:id', authMiddleware, requireAdmin, adminController.unverifyDoctor);

// Appointments
router.get('/appointments', authMiddleware, requireAdmin, adminController.getAllAppointments);

// Payments (admin)
router.get('/payments', authMiddleware, requireAdmin, paymentController.adminGetPayments);
router.patch('/payments/:id/approve', authMiddleware, requireAdmin, paymentController.adminApprovePayment);
router.patch('/payments/:id/reject', authMiddleware, requireAdmin, paymentController.adminRejectPayment);

// Reviews
// Reviews
router.get('/reviews', authMiddleware, requireAdmin, adminController.getAllReviews);
router.delete('/reviews/:id', authMiddleware, requireAdmin, adminController.deleteReviewAdmin);

module.exports = router;
