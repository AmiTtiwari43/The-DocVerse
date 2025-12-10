const Review = require('../models/Review');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Notification = require('../models/Notification');

// Helper to recalculate doctor rating
const recalculateDoctorRating = async (doctorId) => {
  const reviews = await Review.find({ doctorId });
  // Rating is stored in doctor's virtual or calculated on-the-fly
  // This is just for notification/trigger purposes
  return reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
    : 0;
};

// Add review
exports.addReview = async (req, res) => {
  try {
    const { 
      doctorId, 
      rating, 
      comment,
      title,
      isAnonymous,
      isRecommended,
      detailedRatings 
    } = req.body;

    // Validation
    if (!doctorId || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    // Check if patient has completed appointment with this doctor
    const completedAppointment = await Appointment.findOne({
      doctorId,
      patientId: req.user.id,
      status: 'completed',
    });

    if (!completedAppointment) {
      return res
        .status(403)
        .json({
          success: false,
          message: 'You can only review after completing an appointment',
        });
    }

    // Check number of reviews by this user for this doctor
    const existingReviews = await Review.find({
      doctorId,
      patientId: req.user.id,
    });

    if (existingReviews.length >= 3) {
      return res.status(400).json({ 
        success: false, 
        message: 'You can only review a doctor up to 3 times' 
      });
    }

    // Create new review (do not update existing)


    const review = new Review({
      doctorId,
      patientId: req.user.id,
      rating,
      comment,
      title,
      isAnonymous,
      isRecommended,
      detailedRatings,
    });

    await review.save();

    // Notify doctor
    const doctor = await Doctor.findById(doctorId);
    if (doctor) {
      await Notification.create({
        userId: doctor.userId,
        type: 'new_review',
        message: `You received a new review from ${req.user.name}`,
        link: `/doctor/${doctorId}`,
      });
    }

    res.status(201).json({
      success: true,
      data: review,
      message: 'Review added successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get reviews by current patient
exports.getReviewsByPatient = async (req, res) => {
  try {
    const reviews = await Review.find({ patientId: req.user.id })
      .populate('doctorId', 'name specialization')
      .populate('userReplies.userId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get reviews by doctor
exports.getReviewsByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { sortBy, rating } = req.query;

    const query = { doctorId };
    if (rating && rating !== 'all') {
      query.rating = parseInt(rating);
    }

    let sortOption = { createdAt: -1 }; // Default: Newest first
    if (sortBy === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sortBy === 'highest') {
      sortOption = { rating: -1 };
    } else if (sortBy === 'lowest') {
      sortOption = { rating: 1 };
    }

    const reviews = await Review.find(query)
      .populate('patientId', 'name')
      .populate('userReplies.userId', 'name')
      .sort(sortOption);

    // Calculate average rating
    const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

    res.status(200).json({
      success: true,
      data: { reviews, avgRating, totalReviews: reviews.length },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete review
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Check if user is the review author OR Admin
    if (review.patientId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const doctorId = review.doctorId;
    await Review.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get top rated doctors
exports.getTopRatedDoctors = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Get all doctors with their reviews
    const doctors = await Doctor.find({ status: 'verified', isVerified: true })
      .populate('userId', 'name email -_id');

    // Calculate ratings for each doctor
    const doctorsWithRatings = await Promise.all(
      doctors.map(async (doctor) => {
        const reviews = await Review.find({ doctorId: doctor._id });
        const avgRating = reviews.length > 0
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          : 0;
        return {
          ...doctor.toObject(),
          avgRating,
          reviewCount: reviews.length,
        };
      })
    );

    // Sort by rating (highest first) and limit
    const topDoctors = doctorsWithRatings
      .filter((doctor) => doctor.avgRating > 0) // Only doctors with reviews
      .sort((a, b) => b.avgRating - a.avgRating)
      .slice(0, parseInt(limit));

    res.status(200).json({
      success: true,
      data: topDoctors,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Doctor adds reply to a review
exports.addDoctorReply = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { reply } = req.body;

    if (!reply) {
      return res.status(400).json({ success: false, message: 'Reply is required' });
    }

    const review = await Review.findById(reviewId).populate('doctorId');

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Check if user is the doctor
    if (review.doctorId.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Only the doctor can reply to their review' });
    }

    review.doctorReply = reply;
    review.replyDate = new Date();
    await review.save();

    // Notify patient about doctor's reply
    await Notification.create({
      userId: review.patientId,
      type: 'doctor_reply',
      message: `Dr. ${review.doctorId.name} replied to your review`,
      link: `/doctor/${review.doctorId._id}`,
    });

    res.status(200).json({
      success: true,
      data: review,
      message: 'Reply added successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// User adds reply to another user's review
exports.addUserReply = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { reply, parentId } = req.body;

    if (!reply) {
      return res.status(400).json({ success: false, message: 'Reply is required' });
    }

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Add user reply (allow anyone to reply)
    review.userReplies.push({
      userId: req.user.id,
      reply,
      parentId: parentId || null,
      replyDate: new Date(),
    });

    await review.save();
    
    // Populate user details for the response
    await review.populate('userReplies.userId', 'name');

    // Notify original reviewer if not the same person
    if (review.patientId.toString() !== req.user.id) {
      await Notification.create({
        userId: review.patientId,
        type: 'user_reply',
        message: `Someone replied to your review`,
        link: `/doctor/${review.doctorId}`,
      });
    }

    res.status(200).json({
      success: true,
      data: review,
      message: 'Reply added successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get rating distribution for a doctor
exports.getRatingDistribution = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const reviews = await Review.find({ doctorId });

    const distribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    reviews.forEach((review) => {
      distribution[review.rating]++;
    });

    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews : 0;

    res.status(200).json({
      success: true,
      data: {
        distribution,
        avgRating,
        totalReviews,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Like a review
exports.likeReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Check if user already liked
    if (review.likes.includes(req.user.id)) {
      return res.status(400).json({ success: false, message: 'You already liked this review' });
    }

    review.likes.push(req.user.id);
    await review.save();

    res.status(200).json({
      success: true,
      data: review,
      message: 'Review liked successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Unlike a review
exports.unlikeReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Check if user liked the review
    if (!review.likes.includes(req.user.id)) {
      return res.status(400).json({ success: false, message: 'You have not liked this review' });
    }

    review.likes = review.likes.filter(id => id.toString() !== req.user.id);
    await review.save();

    res.status(200).json({
      success: true,
      data: review,
      message: 'Like removed successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// Delete doctor reply
exports.deleteDoctorReply = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Check if user is the doctor OR Admin
    let isDoctor = false;
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (doctor && review.doctorId.toString() === doctor._id.toString()) {
        isDoctor = true;
    }

    if (!isDoctor && req.user.role !== 'admin') {
       return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    review.doctorReply = undefined;
    review.replyDate = undefined;
    await review.save();

    res.status(200).json({
      success: true,
      data: review,
      message: 'Reply deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete user reply
exports.deleteUserReply = async (req, res) => {
  try {
    const { reviewId, replyId } = req.params;
    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Find the reply
    const replyIndex = review.userReplies.findIndex(
      (r) => r._id.toString() === replyId
    );

    if (replyIndex === -1) {
      return res.status(404).json({ success: false, message: 'Reply not found' });
    }

    // Check ownership: Allow reply author OR Admin
    const isReplyAuthor = review.userReplies[replyIndex].userId.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isReplyAuthor && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // Helper to find all descendants
    const getDescendantIds = (parentId, allReplies) => {
      let descendants = [];
      const children = allReplies.filter(
        (r) => r.parentId && r.parentId.toString() === parentId.toString()
      );
      
      children.forEach(child => {
        descendants.push(child._id);
        descendants = [...descendants, ...getDescendantIds(child._id, allReplies)];
      });
      
      return descendants;
    };

    const replyIdToDelete = review.userReplies[replyIndex]._id;
    const idsToDelete = [
      replyIdToDelete,
      ...getDescendantIds(replyIdToDelete, review.userReplies)
    ];

    // Filter out the deleted replies
    review.userReplies = review.userReplies.filter(
      (r) => !idsToDelete.some((id) => id.toString() === r._id.toString())
    );

    await review.save();
    
    // Populate user details for the response
    await review.populate('userReplies.userId', 'name');

    res.status(200).json({
      success: true,
      data: review,
      message: 'Reply deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// Like doctor reply
exports.likeDoctorReply = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const review = await Review.findById(reviewId);

    if (!review || !review.doctorReply) {
      return res.status(404).json({ success: false, message: 'Reply not found' });
    }

    if (review.doctorReplyLikes.includes(req.user.id)) {
      return res.status(400).json({ success: false, message: 'You already liked this reply' });
    }

    review.doctorReplyLikes.push(req.user.id);
    await review.save();

    res.status(200).json({ success: true, data: review, message: 'Reply liked' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Unlike doctor reply
exports.unlikeDoctorReply = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const review = await Review.findById(reviewId);

    if (!review || !review.doctorReply) {
      return res.status(404).json({ success: false, message: 'Reply not found' });
    }

    review.doctorReplyLikes = review.doctorReplyLikes.filter(id => id.toString() !== req.user.id);
    await review.save();

    res.status(200).json({ success: true, data: review, message: 'Like removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Like user reply
exports.likeUserReply = async (req, res) => {
  try {
    const { reviewId, replyId } = req.params;
    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const reply = review.userReplies.id(replyId);
    if (!reply) {
      return res.status(404).json({ success: false, message: 'Reply not found' });
    }

    if (reply.likes.includes(req.user.id)) {
      return res.status(400).json({ success: false, message: 'You already liked this reply' });
    }

    reply.likes.push(req.user.id);
    await review.save();

    res.status(200).json({ success: true, data: review, message: 'Reply liked' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Unlike user reply
exports.unlikeUserReply = async (req, res) => {
  try {
    const { reviewId, replyId } = req.params;
    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const reply = review.userReplies.id(replyId);
    if (!reply) {
      return res.status(404).json({ success: false, message: 'Reply not found' });
    }

    reply.likes = reply.likes.filter(id => id.toString() !== req.user.id);
    await review.save();

    res.status(200).json({ success: true, data: review, message: 'Like removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
