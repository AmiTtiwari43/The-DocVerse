const express = require('express');
const { 
  addReview, 
  getReviewsByDoctor, 
  getReviewsByPatient, 
  deleteReview, 
  getTopRatedDoctors, 
  addDoctorReply, 
  addUserReply, 
  getRatingDistribution, 
  likeReview, 
  unlikeReview,
  deleteDoctorReply,
  deleteUserReply,
  likeDoctorReply,
  unlikeDoctorReply,
  likeUserReply,
  unlikeUserReply
} = require('../controllers/reviewController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Specific routes first (before parameterized routes)
router.post('/', authMiddleware, addReview);
router.get('/', authMiddleware, getReviewsByPatient);
router.get('/top-doctors', getTopRatedDoctors);
router.get('/rating-distribution/:doctorId', getRatingDistribution);

// Review-specific actions (post operations)
router.post('/:reviewId/doctor-reply', authMiddleware, addDoctorReply);
router.post('/:reviewId/user-reply', authMiddleware, addUserReply);
router.post('/:reviewId/like', authMiddleware, likeReview);
router.post('/:reviewId/unlike', authMiddleware, unlikeReview);

// Delete operations
router.delete('/:reviewId/doctor-reply', authMiddleware, deleteDoctorReply);
router.delete('/:reviewId/user-reply/:replyId', authMiddleware, deleteUserReply);

// Like operations for replies
router.post('/:reviewId/doctor-reply/like', authMiddleware, likeDoctorReply);
router.post('/:reviewId/doctor-reply/unlike', authMiddleware, unlikeDoctorReply);
router.post('/:reviewId/user-reply/:replyId/like', authMiddleware, likeUserReply);
router.post('/:reviewId/user-reply/:replyId/unlike', authMiddleware, unlikeUserReply);

// Generic routes (most specific parameterized routes last)
router.get('/:doctorId', getReviewsByDoctor);
router.delete('/:id', authMiddleware, deleteReview);

module.exports = router;
