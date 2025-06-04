/**
 * Converts a time string (e.g. "10:30am-11:50am") to float time ranges
 * @param {string} timeStr - Time range string
 * @returns {[number, number]|null} Array of start and end times as floats, or null if invalid
 */
export const parseTimeRange = (timeStr) => {
  if (!timeStr || !timeStr.includes("-")) return null;

  const toFloatTime = (str) => {
    const [time, meridian] = str.trim().split(/(am|pm)/i);
    let [hour, min = 0] = time.split(":").map(Number);
    if (meridian.toLowerCase() === "pm" && hour !== 12) hour += 12;
    if (meridian.toLowerCase() === "am" && hour === 12) hour = 0;
    return hour + min / 60;
  };

  try {
    const [startStr, endStr] = timeStr.split("-");
    return [toFloatTime(startStr), toFloatTime(endStr)];
  } catch {
    return null;
  }
};

/**
 * Checks if two time blocks conflict
 * @param {Object} a - First time block
 * @param {Object} b - Second time block
 * @returns {boolean} True if there is a conflict
 */
export const hasTimeConflict = (a, b) => {
  if (!a.timeValid || !b.timeValid) return false;
  return a.day === b.day && !(a.end <= b.start || b.end <= a.start);
};

/**
 * Calculates total gap time between events in a schedule
 * @param {Array} schedule - Array of scheduled events
 * @returns {number} Total gap time in hours
 */
export const calculateTotalGap = (schedule) => {
  const dayGroups = {};

  // Group events by day
  for (const item of schedule) {
    if (!item.timeValid || item.day === "---") continue;

    // Split multiple days like "Tuesday, Thursday"
    const days = item.day.split(",").map((d) => d.trim());

    for (const day of days) {
      if (!dayGroups[day]) dayGroups[day] = [];
      dayGroups[day].push({ ...item, day }); // keep a copy for each day
    }
  }

  let totalGap = 0;

  // Calculate gaps for each day
  for (const day in dayGroups) {
    const events = dayGroups[day].sort((a, b) => a.start - b.start);
    for (let i = 1; i < events.length; i++) {
      const gap = events[i].start - events[i - 1].end;
      if (gap > 0) totalGap += gap;
    }
  }

  return totalGap;
}; 