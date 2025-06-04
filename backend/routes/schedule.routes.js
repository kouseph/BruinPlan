import express from 'express';
import { generateSchedules, saveOptimizedSchedule } from '../services/schedule.service.js';
import { deleteUserSchedule } from '../services/user.service.js';
import { isAuthenticated } from '../components/auth.middleware.js';

const router = express.Router();

// Test endpoint - no authentication required
router.post('/api/schedule/test', async (req, res) => {
  try {
    const { courses } = req.body;

    if (!Array.isArray(courses)) {
      return res.status(400).json({ message: 'Courses must be an array' });
    }

    const result = await generateSchedules(courses);
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error generating schedules',
      error: error.message 
    });
  }
});

// POST: Generate optimized schedules from selected courses
router.post('/api/schedule/optimize', isAuthenticated, async (req, res) => {
  try {
    const { courses } = req.body;

    if (!Array.isArray(courses)) {
      return res.status(400).json({ message: 'Courses must be an array' });
    }

    const result = await generateSchedules(courses);
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error generating schedules',
      error: error.message 
    });
  }
});

// POST: Save a generated schedule
router.post('/api/schedules', isAuthenticated, async (req, res) => {
  try {
    const { schedule } = req.body;
    const schedules = await saveOptimizedSchedule(req.user.googleId, schedule);
    res.status(201).json({ 
      message: 'Schedule saved', 
      schedules 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error saving schedule', 
      error: error.message 
    });
  }
});

// DELETE: Remove a saved schedule
router.delete('/api/schedules/:index', isAuthenticated, async (req, res) => {
  try {
    const index = parseInt(req.params.index, 10);
    if (isNaN(index)) {
      return res.status(400).json({ message: 'Invalid schedule index' });
    }

    const schedules = await deleteUserSchedule(req.user.googleId, index);
    res.json({ 
      message: 'Schedule deleted', 
      schedules 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error deleting schedule', 
      error: error.message 
    });
  }
});

export default router; 