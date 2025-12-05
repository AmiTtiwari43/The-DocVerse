const express = require('express');
const {
  getDoctors,
  getDoctorById,
  getDoctorProfile,
  updateDoctor,
  getTopDoctors,
  createDoctorProfile,
  requestVerification,
  updateWorkingHours,
  getDoctorStats,
  replyToReview,
} = require('../controllers/doctorController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/', getDoctors);
router.get('/top', getTopDoctors);
router.get('/profile', authMiddleware, getDoctorProfile);
router.post('/profile', authMiddleware, createDoctorProfile);
router.put('/profile', authMiddleware, updateDoctor);
router.post('/request-verification', authMiddleware, requestVerification);
router.put('/working-hours', authMiddleware, updateWorkingHours);
router.get('/stats/me', authMiddleware, getDoctorStats);
router.post('/reply-review/:reviewId', authMiddleware, replyToReview);
router.get('/:id', getDoctorById);

module.exports = router;
