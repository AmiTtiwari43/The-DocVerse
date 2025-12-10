const { sendEmail, emailTemplates } = require('../utils/emailService');
const User = require('../models/User');

// Contact Us - Send email to admin
exports.contactUs = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Send email to Admin
    const emailData = emailTemplates.contactSupport({ name, email, subject, message });
    await sendEmail({
      to: process.env.ADMIN_EMAIL || 'at5518109@gmail.com', // Use env or fallback to user's email
      ...emailData
    });

    res.status(200).json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get User Profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update User Profile
exports.updateUserProfile = async (req, res) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      phone: req.body.phone,
      address: req.body.address,
      profilePhoto: req.body.profilePhoto
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, data: user, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Profile Update Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
