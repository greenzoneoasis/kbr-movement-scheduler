const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');
const { hashPassword } = require('../utils/auth');

// List all users (admin only)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Change password for a user (admin only)
router.put('/:id/password', protect, adminOnly, async (req, res) => {
  const { newPassword } = req.body;
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    user.password = await hashPassword(newPassword);
    await user.save();
    res.json({ msg: 'Password updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Delete user(s) (admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    // Prevent deleting last admin
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin', _id: { $ne: req.params.id } });
      if (adminCount === 0) {
        return res.status(400).json({ msg: 'Cannot delete the last admin' });
      }
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ msg: 'User deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;