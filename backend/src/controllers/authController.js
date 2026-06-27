const User = require('../models/User');
const Otp = require('../models/Otp');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendOtpEmail } = require('../utils/mailer');

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
};

const signup = async (req, res) => {
  try {
    const { username, email, password, phone } = req.body;
    
    const query = [{ email }, { username }];
    if (phone) {
      query.push({ phone });
    }
    const existingUser = await User.findOne({ $or: query });
    if (existingUser) {
      return res.status(400).json({ error: 'Username, email, or phone number already exists' });
    }

    // Generate and store OTP
    const otp = generateOTP();
    
    // Delete any existing OTP for this email
    await Otp.deleteMany({ email });
    
    const otpEntry = new Otp({ email, otp });
    await otpEntry.save();

    // Send OTP via email
    const emailSent = await sendOtpEmail(email, otp);
    if (!emailSent) {
      return res.status(500).json({ error: 'Failed to send OTP email' });
    }

    res.status(200).json({ message: 'OTP sent successfully to email' });
  } catch (error) {
    console.error('Signup OTP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const verifySignupOtp = async (req, res) => {
  try {
    const { username, email, password, phone, otp } = req.body;

    const otpEntry = await Otp.findOne({ email, otp });
    if (!otpEntry) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Double check user doesn't exist
    const query = [{ email }, { username }];
    if (phone) {
      query.push({ phone });
    }
    const existingUser = await User.findOne({ $or: query });
    if (existingUser) {
      return res.status(400).json({ error: 'Username, email, or phone number already exists' });
    }

    const password_hash = await bcrypt.hash(password, 12);
    const user = new User({ username, email, password_hash, phone });
    await user.save();

    // Delete OTP after successful signup
    await Otp.deleteMany({ email });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_SECRET, { expiresIn: process.env.REFRESH_EXPIRES_IN });
    
    res.status(201).json({ 
      token, 
      refreshToken,
      user: { id: user._id, username: user.username, email: user.email, role: user.role, wallet_balance: user.wallet_balance } 
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: 'Account is disabled' });
    }

    if (user.role === 'admin') {
      const otp = generateOTP();
      await Otp.deleteMany({ email });
      const otpEntry = new Otp({ email, otp });
      await otpEntry.save();
      
      const emailSent = await sendOtpEmail(email, otp);
      if (!emailSent) {
        return res.status(500).json({ error: 'Failed to send 2FA OTP email' });
      }
      return res.json({ requires2FA: true, email: user.email });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_SECRET, { expiresIn: process.env.REFRESH_EXPIRES_IN });

    res.json({ 
      token, 
      refreshToken,
      user: { id: user._id, username: user.username, email: user.email, role: user.role, wallet_balance: user.wallet_balance } 
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const refresh = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ error: 'Refresh token required' });

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ error: 'Invalid refresh token' });

    const newToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    res.json({ token: newToken });
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
};

const verifyLoginOtp = async (req, res) => {
  try {
    const { email, password, otp } = req.body;
    
    // Check OTP
    const otpEntry = await Otp.findOne({ email, otp });
    if (!otpEntry) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Re-verify credentials just to be safe
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Delete OTP after successful login
    await Otp.deleteMany({ email });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_SECRET, { expiresIn: process.env.REFRESH_EXPIRES_IN });

    res.json({ 
      token, 
      refreshToken,
      user: { id: user._id, username: user.username, email: user.email, role: user.role, wallet_balance: user.wallet_balance } 
    });
  } catch (error) {
    console.error('Verify Login OTP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      // Return 200 even if user not found to prevent email enumeration
      return res.status(200).json({ message: 'If that email exists, an OTP has been sent.' });
    }

    const otp = generateOTP();
    await Otp.deleteMany({ email });
    
    const otpEntry = new Otp({ email, otp });
    await otpEntry.save();

    const emailSent = await sendOtpEmail(email, otp);
    if (!emailSent) {
      return res.status(500).json({ error: 'Failed to send reset OTP email' });
    }

    res.status(200).json({ message: 'If that email exists, an OTP has been sent.' });
  } catch (error) {
    console.error('Forgot Password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const otpEntry = await Otp.findOne({ email, otp });
    if (!otpEntry) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.password_hash = await bcrypt.hash(newPassword, 12);
    await user.save();

    await Otp.deleteMany({ email });

    res.status(200).json({ message: 'Password has been successfully reset' });
  } catch (error) {
    console.error('Reset Password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { signup, verifySignupOtp, login, verifyLoginOtp, refresh, forgotPassword, resetPassword };
