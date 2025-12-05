const express = require('express');
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Simple admin check
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
}

router.get('/doctor', authMiddleware, analyticsController.getDoctorAnalytics);
router.get('/admin', authMiddleware, requireAdmin, analyticsController.getAdminAnalytics);

module.exports = router;

