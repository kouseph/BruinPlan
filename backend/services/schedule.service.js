import { findOptimizedSchedule } from '../utils/scheduleOptimizer.js';
import { getUserByGoogleId, saveUserSchedule } from './user.service.js';

/**
 * Generate optimized schedules for user's selected courses
 */
export const generateSchedules = async (courses) => {
  return findOptimizedSchedule(courses);
};

/**
 * Save an optimized schedule for a user
 */
export const saveOptimizedSchedule = async (googleId, schedule) => {
  const user = await getUserByGoogleId(googleId);
  if (!user) throw new Error('User not found');

  // Validate schedule format
  if (!Array.isArray(schedule)) {
    throw new Error('Invalid schedule format');
  }

  return await saveUserSchedule(googleId, schedule);
}; 