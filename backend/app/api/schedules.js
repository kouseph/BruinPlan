import express from 'express';
import User from '../../models/user.js';

const router = express.Router();

// POST: Add a new schedule
router.post('/api/schedules', async (req, res) => {
  try {
    const userId = req.user.googleId;
    const { schedule } = req.body;

    if (!Array.isArray(schedule)) {
      return res.status(400).json({ message: 'Invalid schedule format' });
    }

    const user = await User.findOne({ googleId: userId });
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.schedules.push(schedule);
    await user.save();

    res.status(201).json({ message: 'Schedule saved', schedules: user.schedules });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE: Remove a schedule by index
router.delete('/api/schedules/:index', async (req, res) => {
  try {
    const userId = req.user.googleId;
    const index = parseInt(req.params.index, 10);

    const user = await User.findOne({ googleId: userId });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (isNaN(index) || index < 0 || index >= user.schedules.length) {
      return res.status(400).json({ message: 'Invalid schedule index' });
    }

    user.schedules.splice(index, 1);
    await user.save();

    res.status(200).json({ message: 'Schedule deleted', schedules: user.schedules });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

export default router;
