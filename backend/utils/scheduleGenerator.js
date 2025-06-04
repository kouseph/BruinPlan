import { parseTimeRange, hasTimeConflict } from './timeUtils.js';

/**
 * Checks if there are any conflicts in final exams
 * @param {Array} exams - Array of final exam events
 * @returns {boolean} True if there is a conflict
 */
const hasFinalExamConflict = (exams) => {
  const finals = exams.filter((f) => f.timeValid);
  for (let i = 0; i < finals.length; i++) {
    for (let j = i + 1; j < finals.length; j++) {
      if (hasTimeConflict(finals[i], finals[j])) {
        return true;
      }
    }
  }
  return false;
};

/**
 * Generates all possible schedule combinations
 * @param {Array} courses - Array of course objects
 * @returns {Array} Array of schedule objects with schedule and finals
 */
const generateAllSchedules = (courses) => {
  function backtrack(i, currentSchedule, currentFinals) {
    if (i === courses.length)
      return [{ schedule: currentSchedule, finals: currentFinals }];

    const course = courses[i];
    const lectureRange = parseTimeRange(course.time);
    const timeValid = !!lectureRange && !!course.day;

    const lectureEvent = {
      day: timeValid ? course.day : "---",
      timeValid,
      start: timeValid ? lectureRange[0] : null,
      end: timeValid ? lectureRange[1] : null,
      type: "lecture",
      course: course.course,
      timeStr: timeValid ? course.time : "---",
    };

    // Handle final exam
    const examTimeRange = parseTimeRange(course.finalExam?.time);
    const examValid = !!examTimeRange && course.finalExam?.day && course.finalExam.day !== "---";

    const finalExamEvent = {
      day: examValid ? course.finalExam.day : "---",
      timeValid: examValid,
      start: examValid ? examTimeRange[0] : null,
      end: examValid ? examTimeRange[1] : null,
      type: "final",
      course: course.course,
      timeStr: examValid ? course.finalExam.time : "---",
    };

    const results = [];
    const discussionOptions = course.discussions?.length > 0 ? course.discussions : [null];

    for (const discussion of discussionOptions) {
      const schedCopy = [...currentSchedule, lectureEvent];
      const finalsCopy = [...currentFinals, finalExamEvent];

      if (discussion) {
        const disRange = parseTimeRange(discussion.time);
        const disValid = !!disRange && !!discussion.day;
        schedCopy.push({
          day: disValid ? discussion.day : "---",
          timeValid: disValid,
          start: disValid ? disRange[0] : null,
          end: disValid ? disRange[1] : null,
          type: "discussion",
          course: course.course,
          section: discussion.section,
          timeStr: disValid ? discussion.time : "---",
        });
      }

      results.push(...backtrack(i + 1, schedCopy, finalsCopy));
    }

    return results;
  }

  return backtrack(0, [], []);
};

/**
 * Validates a schedule for conflicts
 * @param {Object} scheduleObj - Schedule object containing schedule and finals
 * @returns {boolean} True if schedule is valid
 */
const isValidSchedule = (scheduleObj) => {
  const { schedule, finals } = scheduleObj;

  // Check for conflicts in regular schedule
  for (let i = 0; i < schedule.length; i++) {
    for (let j = i + 1; j < schedule.length; j++) {
      if (hasTimeConflict(schedule[i], schedule[j])) return false;
    }
  }

  // Check for conflicts in finals
  if (hasFinalExamConflict(finals)) return false;

  return true;
};

export { generateAllSchedules, isValidSchedule }; 