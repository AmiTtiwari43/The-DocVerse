const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendEmail, emailTemplates } = require('../utils/emailService');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// OTP Generator
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Google Login
exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Google token is required' });
    }

    // Verify Google Token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID, 
    });
    
    const { name, email, picture, sub: googleId } = ticket.getPayload();

    if (!email) {
      return res.status(400).json({ success: false, message: 'Google account does not have an email' });
    }

    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      // If user exists but no googleId (was email/pass user), link them?
      // Or just log them in. Linking is better.
      if (!user.googleId) {
        user.googleId = googleId;
      }
      // If user exists and is not verified, verify them since Google email is verified?
      // Yes, trust Google.
      if (!user.isVerified) {
        user.isVerified = true;
      }
      await user.save();
    } else {
      // Create new user
      user = new User({
        name,
        email,
        googleId, // Set googleId
        profilePhoto: picture,
        role: 'patient', // Default role
        isVerified: true, // Google emails are verified
        password: '', // No password for Google users
      });
      await user.save();
    }

    // Generate token
    const jwtToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    // Set cookie
    res.cookie('token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      data: { id: user._id, name: user.name, email: user.email, role: user.role, profilePhoto: user.profilePhoto },
      message: 'Google login successful',
    });

  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(500).json({ success: false, message: 'Google authentication failed' });
  }
};

// Signup
exports.signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password) {
      console.log('Signup Failed: Missing fields');
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('Signup Failed: Invalid email format');
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    // Password strength validation (Min 8 chars, 1 number, 1 special char)
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
    if (!passwordRegex.test(password)) {
      console.log('Signup Failed: Weak password');
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 8 characters long and include at least one number and one special character.' 
      });
    }

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      if (user.isVerified) {
        console.log('Signup Failed: Email already registered');
        return res.status(400).json({ success: false, message: 'Email already registered' });
      } else {
        // Resend OTP if user exists but not verified (optional, or just delete and recreate)
        // For simplicity, we can update the existing unverified user
      }
    }

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    if (user && !user.isVerified) {
      user.name = name;
      user.password = password; // Will be hashed by pre-save
      user.role = role || 'patient';
      user.otp = otp;
      user.otpExpires = otpExpires;
    } else {
      user = new User({ 
        name, 
        email, 
        password, 
        role: role || 'patient',
        otp,
        otpExpires,
        isVerified: false 
      });
    }

    await user.save();

    // Send OTP Email
    try {
      const emailData = emailTemplates.verifyEmail(otp);
      await sendEmail({
        to: email,
        ...emailData
      });
    } catch (err) {
      console.error("OTP send failed", err);
      // Clean up if email fails? Or let generic error catch it?
      // user.delete() // Optional
      return res.status(500).json({ success: false, message: 'Failed to send verification email' });
    }

    res.status(201).json({
      success: true,
      message: 'Verification Code sent to your email',
      email: email // Send back email to help frontend redirect
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Verify Email & OTP
exports.verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      console.log('Verify Failed: Missing email or otp');
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      console.log('Verify Failed: User not found');
      return res.status(400).json({ success: false, message: 'User not found' });
    }

    if (user.isVerified) {
      console.log('Verify Failed: Already verified');
      return res.status(400).json({ success: false, message: 'Email already verified' });
    }

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      console.log(`Verify Failed: Invalid OTP. Expected ${user.otp}, Got ${otp}`);
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Generate token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      data: { id: user._id, name: user.name, email: user.email, role: user.role },
      message: 'Email verified successfully',
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check verification
    // Note: Admin accounts created by seed might be verified by default? 
    // We should ensure seed script sets isVerified: true for them.
    // Assuming schema default is false, but seed sets it?
    // Let's add a fallback: if 'admin' role, assume verified? 
    // No, better to having data correct.
    if (!user.isVerified) {
       return res.status(401).json({ success: false, message: 'Please verify your email first' });
    }

    // Check password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      data: { id: user._id, name: user.name, email: user.email, role: user.role },
      message: 'Login successful',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Logout
exports.logout = (req, res) => {
  try {
    res.clearCookie('token');
    res.status(200).json({ success: true, message: 'Logout successful' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
