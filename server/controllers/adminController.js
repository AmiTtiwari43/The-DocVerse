const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
// Get all users (optionally filter by role)
exports.getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const filter = role ? { role } : {};
    const users = await User.find(filter).select('-password');
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// Verify a doctor
exports.verifyDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { isVerified: true, status: 'verified' },
      { new: true }
    );
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // Notify doctor
    await Notification.create({
      userId: doctor.userId,
      type: 'profile_verified',
      message: 'Your profile has been verified! You are now visible to patients.',
      link: '/dashboard',
    });

    // Send verification email
    const User = require('../models/User');
    const { sendEmail, emailTemplates } = require('../utils/emailService');
    const doctorUser = await User.findById(doctor.userId);
    if (doctorUser && doctorUser.email) {
      const emailData = emailTemplates.profileVerified(doctor);
      await sendEmail({
        to: doctorUser.email,
        ...emailData,
      });
    }

    res.status(200).json({ success: true, data: doctor, message: 'Doctor verified' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reject a doctor
exports.rejectDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected', isVerified: false },
      { new: true }
    );
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    await Notification.create({
      userId: doctor.userId,
      type: 'profile_rejected',
      message: 'Your profile verification was rejected. Please update your profile and resubmit.',
      link: '/dashboard',
    });

    res.status(200).json({ success: true, data: doctor, message: 'Doctor rejected' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get pending doctors
exports.getPendingDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ status: 'pending' })
      .populate('userId', 'name email')
      .sort({ verificationRequestedAt: -1 });
    res.status(200).json({ success: true, data: doctors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// Un-verify a doctor
exports.unverifyDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { isVerified: false },
      { new: true }
    );
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    res.status(200).json({ success: true, data: doctor, message: 'Doctor unverified' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// List all appointments
exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('doctorId', 'name specialization')
      .populate('patientId', 'name email')
      .sort({ date: -1 });
    res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// Block/Unblock user
exports.blockUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBlocked: true },
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, data: user, message: 'User blocked' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.unblockUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBlocked: false },
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, data: user, message: 'User unblocked' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a user (optional, not safe for default)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// Delete a review (optional)
exports.deleteReviewAdmin = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    res.status(200).json({ success: true, message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
