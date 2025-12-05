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
    const { doctorId, rating, comment } = req.body;

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

    // Check if already reviewed
    const existingReview = await Review.findOne({
      doctorId,
      patientId: req.user.id,
    });

    if (existingReview) {
      // Update existing review
      existingReview.rating = rating;
      existingReview.comment = comment;
      await existingReview.save();

      return res
        .status(200)
        .json({
          success: true,
          data: existingReview,
          message: 'Review updated successfully',
        });
    }

    const review = new Review({
      doctorId,
      patientId: req.user.id,
      rating,
      comment,
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

    const reviews = await Review.find({ doctorId })
      .populate('patientId', 'name')
      .sort({ createdAt: -1 });

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

    if (review.patientId.toString() !== req.user.id) {
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
