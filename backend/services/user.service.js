import User from '../models/user.js';

/**
 * Get user by Google ID
 */
export const getUserByGoogleId = async (googleId) => {
  return await User.findOne({ googleId });
};

/**
 * Update user's selected courses
 */
export const updateSelectedCourses = async (googleId, courses) => {
  const user = await User.findOne({ googleId });
  if (!user) throw new Error('User not found');
  
  user.selectedCourses = courses;
  await user.save();
  return user;
};

/**
 * Save schedule for user
 */
export const saveUserSchedule = async (googleId, schedule) => {
  const user = await User.findOne({ googleId });
  if (!user) throw new Error('User not found');

  user.schedules.push(schedule);
  await user.save();
  return user.schedules;
};

/**
 * Delete user schedule by index
 */
export const deleteUserSchedule = async (googleId, index) => {
  const user = await User.findOne({ googleId });
  if (!user) throw new Error('User not found');

  if (index < 0 || index >= user.schedules.length) {
    throw new Error('Invalid schedule index');
  }

  user.schedules.splice(index, 1);
  await user.save();
  return user.schedules;
}; 