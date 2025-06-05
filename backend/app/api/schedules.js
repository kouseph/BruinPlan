import express from 'express';
import User from '../../models/user.js';

const router = express.Router();

// POST: Add a new schedule
router.post('/api/schedules', async (req, res) => {
  try {
    const userId = req.user.googleId;
    const { schedule } = req.body;

    console.log('Saving schedule for user:', userId);
    console.log('Schedule data:', JSON.stringify(schedule, null, 2));

    if (!Array.isArray(schedule)) {
      console.error('Invalid schedule format - not an array');
      return res.status(400).json({ message: 'Invalid schedule format' });
    }

    // Validate schedule entries
    const isValidSchedule = schedule.every(entry => {
      const hasRequiredFields = entry.course && entry.day && entry.timeStr && 
                              entry.type && entry.timeValid !== undefined;
      if (!hasRequiredFields) {
        console.error('Invalid schedule entry:', entry);
      }
      return hasRequiredFields;
    });

    if (!isValidSchedule) {
      console.error('Schedule validation failed - missing required fields');
      return res.status(400).json({ message: 'Invalid schedule format - missing required fields' });
    }

    const user = await User.findOne({ googleId: userId });
    if (!user) {
      console.error('User not found:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Found user, current schedules count:', user.schedules.length);
    user.schedules.push(schedule);
    await user.save();
    console.log('Schedule saved, new schedules count:', user.schedules.length);

    res.status(201).json({ 
      message: 'Schedule saved', 
      schedules: user.schedules,
      savedScheduleIndex: user.schedules.length - 1
    });
  } catch (err) {
    console.error('Error saving schedule:', err);
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
