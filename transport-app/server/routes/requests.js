const express = require('express');
const router = express.Router();
const MovementRequest = require('../models/MovementRequest');
const { protect, adminOnly } = require('../middleware/auth');

// Create a new movement request
router.post('/', protect, async (req, res) => {
  try {
    const { name, position, date, time, route, notes } = req.body;
    if (!name || !position || !date || !time || !route) {
      return res.status(400).json({ msg: 'Required fields are missing' });
    }
    const request = new MovementRequest({ name, position, date, time, route, notes, user: req.user.id });
    await request.save();
    res.json(request);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get current user's requests (optionally filter by status)
router.get('/my', protect, async (req, res) => {
  try {
    const { status } = req.query;
    const query = { user: req.user.id };
    if (status) query.status = status;
    const requests = await MovementRequest.find(query).sort({ date: 1 });
    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Upcoming events (scheduled or completed with date >= now)
router.get('/upcoming', protect, async (req, res) => {
  try {
    const now = new Date();
    const query = { date: { $gte: now }, status: { $in: ['scheduled', 'completed'] } };
    if (req.user.role !== 'admin') {
      query.user = req.user.id;
    }
    const events = await MovementRequest.find(query);
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// History events (date < now)
router.get('/history', protect, async (req, res) => {
  try {
    const now = new Date();
    const query = { date: { $lt: now } };
    if (req.user.role !== 'admin') {
      query.user = req.user.id;
    }
    const events = await MovementRequest.find(query);
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Pending requests for admin review
router.get('/pending', protect, adminOnly, async (req, res) => {
  try {
    const requests = await MovementRequest.find({ status: 'pending' }).populate('user', 'lastName');
    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Approve a request
router.put('/:id/approve', protect, adminOnly, async (req, res) => {
  try {
    const request = await MovementRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ msg: 'Request not found' });
    request.status = 'scheduled';
    await request.save();
    res.json({ msg: 'Request approved' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Decline a request
router.put('/:id/decline', protect, adminOnly, async (req, res) => {
  try {
    const request = await MovementRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ msg: 'Request not found' });
    request.status = 'declined';
    request.notes = req.body.reason || request.notes;
    await request.save();
    res.json({ msg: 'Request declined' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Stats endpoint (admin only) - returns counts of requests by month and status
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const pipeline = [
      {
        $group: {
          _id: {
            month: { $month: '$date' },
            year: { $year: '$date' },
            status: '$status',
            route: '$route'
          },
          count: { $sum: 1 }
        }
      }
    ];
    const results = await MovementRequest.aggregate(pipeline);
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;