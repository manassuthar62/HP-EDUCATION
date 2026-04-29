const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { sendEmail } = require('../utils/emailService');
const { getOTPTemplate } = require('../utils/emailTemplates');

// Login Step 1: Verify Credentials and Send OTP
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
    await user.save();

    const html = getOTPTemplate(otp, 'login');

    // Send to all configured emails
    const recipients = [user.email];
    if (process.env.SECONDARY_EMAIL) recipients.push(process.env.SECONDARY_EMAIL);
    if (process.env.THIRD_EMAIL) recipients.push(process.env.THIRD_EMAIL);

    for (const email of recipients) {
      await sendEmail(email, 'Login Verification Code - HP GROUP OF EDUCATION', html);
    }

    res.json({ message: 'OTP sent to your registered email(s).', requiresOtp: true, username: user.username });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login Step 2: Verify OTP
router.post('/verify-otp', async (req, res) => {
  const { username, otp } = req.body;
  try {
    const user = await User.findOne({ username });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.otp || user.otp !== otp) {
      return res.status(401).json({ message: 'Invalid OTP' });
    }

    if (new Date() > user.otpExpires) {
      return res.status(401).json({ message: 'OTP expired' });
    }

    // Clear OTP after successful login
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ 
      message: 'Login successful', 
      user: { username: user.username, role: user.role } 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  const { identifier } = req.body; // Can be username or email
  try {
    const user = await User.findOne({ 
      $or: [{ username: identifier }, { email: identifier }] 
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.email) {
      return res.status(400).json({ message: 'No email associated with this account. Please contact admin.' });
    }

    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); background-color: #ffffff; border: 1px solid #e5e7eb;">
        <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 22px;">HP GROUP OF EDUCATION</h1>
          <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Password Recovery Service</p>
        </div>
        <div style="padding: 40px 30px; text-align: center;">
          <p style="font-size: 18px; color: #1f2937; margin-bottom: 20px;">DEAR HP SIR,</p>
          <p style="color: #4b5563; line-height: 1.6; margin-bottom: 30px;">You requested to recover your password. Here are your credentials for the Admin Panel:</p>
          
          <div style="background-color: #f3f4f6; padding: 25px; border-radius: 10px; display: inline-block; min-width: 250px; text-align: left; border: 1px solid #d1d5db;">
            <p style="margin: 0 0 10px 0; color: #374151;"><strong>Username:</strong> <span style="color: #1e3a8a;">${user.username}</span></p>
            <p style="margin: 0; color: #374151;"><strong>Password:</strong> <span style="color: #1e3a8a;">${user.password}</span></p>
          </div>
          
          <p style="margin-top: 30px; font-size: 13px; color: #ef4444; background-color: #fef2f2; padding: 10px; border-radius: 6px;">
            <strong>Warning:</strong> For your security, please change your password after logging in.
          </p>
        </div>
        <div style="padding: 20px; background-color: #f9fafb; text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb;">
          &copy; ${new Date().getFullYear()} HP GROUP OF EDUCATION. All rights reserved.
        </div>
      </div>
    `;

    const result = await sendEmail(user.email, 'Password Recovery - HP GROUP OF EDUCATION', html);

    if (result.success) {
      res.json({ message: 'Password sent to your registered email.' });
    } else {
      res.status(500).json({ message: 'Failed to send email. Please try again later.' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Change Password Step 1: Verify Old Password and Send OTP
router.post('/change-password', async (req, res) => {
  const { username, oldPassword } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user || user.password !== oldPassword) {
      return res.status(401).json({ message: 'Incorrect old password' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
    await user.save();

    const html = getOTPTemplate(otp, 'password');

    const recipients = [user.email];
    if (process.env.SECONDARY_EMAIL) recipients.push(process.env.SECONDARY_EMAIL);
    if (process.env.THIRD_EMAIL) recipients.push(process.env.THIRD_EMAIL);

    for (const email of recipients) {
      await sendEmail(email, 'Password Change Verification - HP GROUP OF EDUCATION', html);
    }

    res.json({ message: 'OTP sent to your registered email(s).', requiresOtp: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Change Password Step 2: Verify OTP and Update Password
router.post('/verify-change-password', async (req, res) => {
  const { username, otp, newPassword } = req.body;
  try {
    const user = await User.findOne({ username });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.otp || user.otp !== otp) {
      return res.status(401).json({ message: 'Invalid OTP' });
    }

    if (new Date() > user.otpExpires) {
      return res.status(401).json({ message: 'OTP expired' });
    }

    user.password = newPassword;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
