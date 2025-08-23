const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const User = require('../models/User');
const { hashPassword, comparePassword, generateToken } = require('../utils/auth');
const { protect, adminOnly } = require('../middleware/auth');
const nodemailer = require('nodemailer');

// Create transporter for sending emails (use environment vars)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Helper to send email
async function sendEmail(to, subject, html) {
  try {
    await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, html });
  } catch (err) {
    console.error('Failed to send email', err.message);
  }
}

// Admin invite endpoint
router.post('/invite', protect, adminOnly, async (req, res) => {
  const { email } = req.body;
  try {
    // Generate random token
    const invitationToken = crypto.randomBytes(20).toString('hex');
    // Create user record with invitation token
    let existing = await User.findOne({ email });
    if (existing) {
      // If user exists and is verified, don't allow invite
      if (existing.verified) {
        return res.status(400).json({ msg: 'User already exists' });
      }
      existing.invitationToken = invitationToken;
      await existing.save();
    } else {
      const user = new User({ email, invitationToken });
      await user.save();
    }
    // Send invitation email
    const signupLink = `${process.env.CLIENT_URL}/signup?token=${invitationToken}&email=${encodeURIComponent(email)}`;
    const html = `<p>You have been invited to join the transport system.</p><p>Click <a href="${signupLink}">here</a> to sign up.</p>`;
    await sendEmail(email, 'Invitation to join Transport App', html);
    res.json({ msg: 'Invitation sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Signup: invited users complete registration
router.post('/signup', async (req, res) => {
  const { firstName, lastName, email, password, token } = req.body;
  try {
    const user = await User.findOne({ email, invitationToken: token });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid invitation token' });
    }
    // Hash password
    const hashed = await hashPassword(password);
    user.firstName = firstName;
    user.lastName = lastName;
    user.password = hashed;
    user.verified = false;
    user.invitationToken = null;
    await user.save();
    // Send verification email (token for verifying account)
    const verifyToken = crypto.randomBytes(20).toString('hex');
    user.verificationToken = verifyToken;
    await user.save();
    const verifyLink = `${process.env.CLIENT_URL}/verify?token=${verifyToken}&email=${encodeURIComponent(email)}`;
    const html = `<p>Please verify your email by clicking <a href="${verifyLink}">here</a>.</p>`;
    await sendEmail(email, 'Verify your Transport App account', html);
    res.json({ msg: 'Signup successful. Check your email for verification link.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Email verification
router.post('/verify', async (req, res) => {
  const { email, token } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || user.verified) {
      return res.status(400).json({ msg: 'Invalid verification' });
    }
    if (user.verificationToken !== token) {
      return res.status(400).json({ msg: 'Invalid verification token' });
    }
    user.verified = true;
    user.verificationToken = null;
    await user.save();
    res.json({ msg: 'Email verified. You can now login.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ msg: 'Invalid credentials' });
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) return res.status(401).json({ msg: 'Invalid credentials' });
    if (!user.verified) return res.status(401).json({ msg: 'Please verify your email' });
    const token = generateToken(user);
    res.json({ token, user: { id: user._id, role: user.role, firstName: user.firstName, lastName: user.lastName, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;