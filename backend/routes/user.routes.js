import express from 'express';
import { getUserByGoogleId, updateSelectedCourses } from '../services/user.service.js';
import { isAuthenticated } from '../components/auth.middleware.js';

const router = express.Router();

// GET: Return the logged-in user's info
router.get('/api/user', isAuthenticated, async (req, res) => {
  try {
    const user = await getUserByGoogleId(req.user.googleId);
    res.json({
      googleId: user.googleId,
      name: user.name,
      email: user.email,
      selectedCourses: user.selectedCourses || [],
      schedules: user.schedules || [],
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST: Update user's selected courses
router.post('/api/user/courses', isAuthenticated, async (req, res) => {
  try {
    const { courses } = req.body;
    
    if (!Array.isArray(courses)) {
      return res.status(400).json({ message: 'Courses must be an array' });
    }

    const user = await updateSelectedCourses(req.user.googleId, courses);
    
    res.json({
      message: 'Courses updated successfully',
      selectedCourses: user.selectedCourses
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router; 