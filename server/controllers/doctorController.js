const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Review = require('../models/Review');
const Notification = require('../models/Notification');

// Get all doctors with filters
exports.getDoctors = async (req, res) => {
  try {
    const { city, specialization, gender, minFee, maxFee, minExperience, sort } = req.query;

    let filter = { status: 'verified', isVerified: true };
    if (city) filter.city = city;
    if (specialization) filter.specialization = specialization;
    if (gender) filter.gender = gender;
    if (minFee || maxFee) {
      filter.fees = {};
      if (minFee) filter.fees.$gte = Number(minFee);
      if (maxFee) filter.fees.$lte = Number(maxFee);
    }
    if (minExperience) filter.experience = { $gte: Number(minExperience) };

    let query = Doctor.find(filter).populate('userId', 'name email -_id');
    
    // Get doctors with ratings
    const doctors = await query;
    const doctorsWithRatings = await Promise.all(
      doctors.map(async (doctor) => {
        const reviews = await Review.find({ doctorId: doctor._id });
        const avgRating = reviews.length > 0 
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
          : 0;
        return { ...doctor.toObject(), avgRating, reviewCount: reviews.length };
      })
    );

    // Sort
    if (sort === 'rating') {
      doctorsWithRatings.sort((a, b) => b.avgRating - a.avgRating);
    } else if (sort === 'fee_low') {
      doctorsWithRatings.sort((a, b) => a.fees - b.fees);
    } else if (sort === 'fee_high') {
      doctorsWithRatings.sort((a, b) => b.fees - a.fees);
    } else if (sort === 'experience') {
      doctorsWithRatings.sort((a, b) => b.experience - a.experience);
    }

    res.status(200).json({ success: true, data: doctorsWithRatings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get doctor by ID
exports.getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('userId', 'name email');

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // Get reviews for this doctor
    const reviews = await Review.find({ doctorId: doctor._id }).populate('patientId', 'name');

    res.status(200).json({ success: true, data: { ...doctor.toObject(), reviews } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get doctor profile by current user
exports.getDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.id }).populate('userId', 'name email');

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    res.status(200).json({ success: true, data: doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update doctor profile
exports.updateDoctor = async (req, res) => {
  try {
    const { name, specialization, experience, fees, city, bio, gender, licenseNumber } = req.body;

    let doctor = await Doctor.findOne({ userId: req.user.id });

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    if (name) doctor.name = name;
    if (specialization) doctor.specialization = specialization;
    if (experience) doctor.experience = experience;
    if (fees) doctor.fees = fees;
    if (city) doctor.city = city;
    if (bio !== undefined) doctor.bio = bio;
    if (gender) doctor.gender = gender;
    if (licenseNumber) doctor.licenseNumber = licenseNumber;

    await doctor.save();

    res.status(200).json({ success: true, data: doctor, message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get top doctors (ranked by average rating)
exports.getTopDoctors = async (req, res) => {
  try {
    const { city, limit = 10 } = req.query;
    let filter = { status: 'verified', isVerified: true };
    if (city) filter.city = city;

    const doctors = await Doctor.find(filter).populate('userId', 'name email');

    // Calculate average rating for each doctor
    const doctorsWithRatings = await Promise.all(
      doctors.map(async (doctor) => {
        const reviews = await Review.find({ doctorId: doctor._id });
        const avgRating =
          reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
        return { ...doctor.toObject(), avgRating, reviewCount: reviews.length };
      })
    );

    // Sort by rating and limit
    const topDoctors = doctorsWithRatings
      .filter(d => d.avgRating > 0)
      .sort((a, b) => b.avgRating - a.avgRating)
      .slice(0, Number(limit));

    res.status(200).json({ success: true, data: topDoctors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Request verification
exports.requestVerification = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    doctor.status = 'pending';
    doctor.verificationRequestedAt = new Date();
    await doctor.save();

    res.status(200).json({ success: true, data: doctor, message: 'Verification request submitted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update working hours
exports.updateWorkingHours = async (req, res) => {
  try {
    const { days, startTime, endTime } = req.body;
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    doctor.workingHours = { days, startTime, endTime };
    await doctor.save();

    res.status(200).json({ success: true, data: doctor, message: 'Working hours updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get doctor stats
exports.getDoctorStats = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    const Appointment = require('../models/Appointment');
    const reviews = await Review.find({ doctorId: doctor._id });
    const appointments = await Appointment.find({ doctorId: doctor._id });
    
    const avgRating = reviews.length > 0 
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
      : 0;

    res.status(200).json({
      success: true,
      data: {
        totalReviews: reviews.length,
        avgRating,
        totalAppointments: appointments.length,
        pendingAppointments: appointments.filter(a => a.status === 'pending').length,
        completedAppointments: appointments.filter(a => a.status === 'completed').length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reply to review
exports.replyToReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { reply } = req.body;
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    const review = await Review.findById(reviewId);
    if (!review || review.doctorId.toString() !== doctor._id.toString()) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    review.doctorReply = reply;
    review.replyDate = new Date();
    await review.save();

    // Notify patient
    await Notification.create({
      userId: review.patientId,
      type: 'review_reply',
      message: `Dr. ${doctor.name} replied to your review`,
      link: `/doctor/${doctor._id}`,
    });

    res.status(200).json({ success: true, data: review, message: 'Reply posted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create doctor profile (only for doctors)
exports.createDoctorProfile = async (req, res) => {
  try {
    const { name, specialization, experience, fees, city, bio, gender, licenseNumber } = req.body;

    // Validation
    if (!name || !specialization || !experience || !fees || !city) {
      return res.status(400).json({ success: false, message: 'All required fields must be provided' });
    }

    // Check if doctor profile already exists
    const existingDoctor = await Doctor.findOne({ userId: req.user.id });
    if (existingDoctor) {
      return res.status(400).json({ success: false, message: 'Doctor profile already exists' });
    }

    const doctor = new Doctor({
      userId: req.user.id,
      name,
      specialization,
      experience,
      fees,
      city,
      bio,
      gender,
      licenseNumber,
    });

    await doctor.save();

    res.status(201).json({ success: true, data: doctor, message: 'Doctor profile created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
