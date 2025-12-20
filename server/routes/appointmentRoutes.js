const express = require('express');
const {
  createAppointment,
  getAppointmentsByUser,
  updateAppointmentStatus,
  getAvailableSlots,
  markAsCompleted,
  rescheduleAppointment,
} = require('../controllers/appointmentController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/', authMiddleware, createAppointment);
router.get('/', authMiddleware, getAppointmentsByUser);
router.get('/available-slots', getAvailableSlots);
router.put('/:id', authMiddleware, updateAppointmentStatus);
router.patch('/:id/complete', authMiddleware, markAsCompleted);
router.patch('/:id/reschedule', authMiddleware, rescheduleAppointment);

module.exports = router;
