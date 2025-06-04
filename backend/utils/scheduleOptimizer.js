import { calculateTotalGap } from './timeUtils.js';
import { generateAllSchedules, isValidSchedule } from './scheduleGenerator.js';

/**
 * Finds all valid schedules sorted by total gap time
 * @param {Array} courses - Array of course objects
 * @returns {Object} Object containing success status, schedules, and message
 */
export const findOptimizedSchedule = (courses) => {
  try {
    // Generate all possible schedules
    const allSchedules = generateAllSchedules(courses);
    
    // Filter valid schedules
    const validSchedules = allSchedules.filter(isValidSchedule);

    if (validSchedules.length === 0) {
      return {
        success: false,
        schedules: [],
        message: "No valid schedule found: lectures, discussions, or final exams conflict."
      };
    }

    // Sort schedules by total gap time
    const sortedSchedules = validSchedules
      .map(sched => ({
        ...sched,
        totalGap: calculateTotalGap(sched.schedule)
      }))
      .sort((a, b) => a.totalGap - b.totalGap);

    // Format response
    const schedules = sortedSchedules.map(sched => ({
      schedule: sched.schedule,
      finals: sched.finals,
      totalGapHours: sched.totalGap
    }));

    return {
      success: true,
      schedules,
      message: `Found ${schedules.length} valid schedule${schedules.length === 1 ? '' : 's'}`
    };

  } catch (error) {
    return {
      success: false,
      schedules: [],
      message: error.message
    };
  }
}; 