import { findOptimizedSchedule } from '../utils/scheduleOptimizer.js';

export const optimizeSchedule = async (req, res) => {
  try {
    const { courses } = req.body;

    // Validate input
    if (!Array.isArray(courses) || courses.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of courses'
      });
    }

    // Validate each course has required properties
    const requiredProps = ['startTime', 'endTime', 'days'];
    const invalidCourse = courses.find(course => 
      !requiredProps.every(prop => course.hasOwnProperty(prop))
    );

    if (invalidCourse) {
      return res.status(400).json({
        success: false,
        message: 'Each course must have startTime, endTime, and days properties'
      });
    }

    // Find optimized schedule
    const result = findOptimizedSchedule(courses);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Schedule optimization error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error optimizing schedule',
      error: error.message
    });
  }
}; 