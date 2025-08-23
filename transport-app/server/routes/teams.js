const express = require('express');
const router = express.Router();
const TeamMember = require('../models/TeamMember');
const { protect, adminOnly } = require('../middleware/auth');

// Create a team member
router.post('/', protect, async (req, res) => {
  const { firstName, lastName, position, passport } = req.body;
  if (!firstName || !lastName || !position || !passport) {
    return res.status(400).json({ msg: 'All fields are required' });
  }
  try {
    // Ensure passport unique per user
    const existing = await TeamMember.findOne({ passport, createdBy: req.user.id });
    if (existing) {
      return res.status(400).json({ msg: 'Passport number already exists' });
    }
    const teamMember = new TeamMember({ firstName, lastName, position, passport, createdBy: req.user.id });
    await teamMember.save();
    res.json(teamMember);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get current user's team members
router.get('/my', protect, async (req, res) => {
  try {
    const members = await TeamMember.find({ createdBy: req.user.id });
    res.json(members);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Admin: get all team members
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const members = await TeamMember.find().populate('createdBy', 'lastName');
    res.json(members);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;