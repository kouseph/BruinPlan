import express from 'express';
import { findAllOptimizedSchedules } from '../scripts/findSchedule.js';
// import { generateSchedules, saveOptimizedSchedule, findAllOptimizedSchedules } from '../services/schedule.service.js';
import { deleteUserSchedule } from '../services/user.service.js';
import { isAuthenticated } from '../components/auth.middleware.js';
import User from '../models/user.js';

const router = express.Router();

// Test endpoint - no authentication required
router.post('/api/schedule/test', async (req, res) => {
  try {
    const { courses } = req.body;
    console.log("this is the backend api log",courses);

    if (!Array.isArray(courses)) {
      return res.status(400).json({ message: 'Courses must be an array' });
    }

    const result = await findAllOptimizedSchedules(courses);
    console.log(result)
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
    console.log("this is the backend api log",result.length);
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
    console.log('Received schedule data:', JSON.stringify(schedule, null, 2));
    
    // Validate schedule format
    if (!Array.isArray(schedule)) {
      return res.status(400).json({ 
        message: 'Schedule must be an array' 
      });
    }

    // Find user
    const user = await User.findOne({ googleId: req.user.googleId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Ensure schedules is initialized as an array
    if (!Array.isArray(user.schedules)) {
      user.schedules = [];
    }

    // Directly set the schedule as a new element in the schedules array
    const scheduleData = schedule.map(item => ({
      day: item.day,
      timeValid: item.timeValid,
      start: item.start,
      end: item.end,
      type: item.type,
      course: item.course,
      section: item.section,
      timeStr: item.timeStr
    }));

    user.schedules.push(scheduleData);
    console.log('About to save schedule:', JSON.stringify(scheduleData, null, 2));

    // Save with validation
    const savedUser = await user.save();
    console.log('Saved user schedules:', JSON.stringify(savedUser.schedules, null, 2));

    res.status(201).json({ 
      message: 'Schedule saved successfully',
      schedules: savedUser.schedules
    });
  } catch (error) {
    console.error('Save schedule error:', error);
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