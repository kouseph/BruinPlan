import mongoose from 'mongoose';
import course from 'backend/models/course.js';
import User from 'backend/models/user.js';

// Spring 2025 Term
const TERM_START = new Date('2025-03-31');
const TERM_END = new Date('2025-06-06');

// Map full day names to iCal weekday abbreviations
function parseByDay(dayStr = '') {
  dayStr = dayStr.trim();
  if (dayStr === '(No day)' || dayStr.length === 0 || dayStr.startsWith('Varies')) return null;
  if (dayStr.includes('<br')) return ['MO', 'TU', 'WE', 'TH', 'FR'];

  const map = {
    Monday: 'MO',
    Tuesday: 'TU',
    Wednesday: 'WE',
    Thursday: 'TH',
    Friday: 'FR',
    Saturday: 'SA',
    Sunday: 'SU'
  };

  return dayStr
    .split(',')
    .map(d => d.trim())
    .map(d => map[d])
    .filter(Boolean);
}

// Parse time like "2:00pm-3:15pm" into start and end times
function parseTimeRange(timeStr = '') {
  timeStr = timeStr.trim();
  if (timeStr === '(No time)' || !timeStr) return null;

  const [startStr, endStr] = timeStr.split('-').map(s => s.trim());

  const to24 = s => {
    const m = s.match(/^(\d{1,2})(?::(\d{2}))?(am|pm)$/i);
    if (!m) throw new Error(`Cannot parse time "${s}"`);
    let [, h, min = '0', ap] = m;
    h = Number(h);
    min = Number(min);
    ap = ap.toLowerCase();
    if (ap === 'pm' && h !== 12) h += 12;
    if (ap === 'am' && h === 12) h = 0;
    return [h, min];
  };

  return { start: to24(startStr), end: to24(endStr ?? startStr) };
}

// Find the first date in the term that matches a weekday
function firstClassDateForWeekday(weekday) {
  const d = new Date(TERM_START);
  while (d.getDay() !== weekday) d.setDate(d.getDate() + 1);
  return new Date(d);
}

// Convert JS date to UTC timestamp for RRULE UNTIL
function untilUTC(date) {
  const z = n => String(n).padStart(2, '0');
  const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59));
  return `${utc.getUTCFullYear()}${z(utc.getUTCMonth() + 1)}${z(utc.getUTCDate())}T${z(
    utc.getUTCHours()
  )}${z(utc.getUTCMinutes())}${z(utc.getUTCSeconds())}Z`;
}

function formatRRule(rruleObj) {
  const parts = [`FREQ=${rruleObj.freq.toUpperCase()}`];
  if (rruleObj.byday && rruleObj.byday.length > 0) {
    parts.push(`BYDAY=${rruleObj.byday.join(',')}`);
  }
  if (rruleObj.until) {
    parts.push(`UNTIL=${untilUTC(rruleObj.until)}`);
  }
  return parts.join(';');
}

// Convert date array [Y,M,D,H,M] to UTC format string for DTSTART/DTEND
function toUTCString(arr) {
  const [y, m, d, h, min] = arr;
  const utcDate = new Date(Date.UTC(y, m - 1, d, h, min, 0));
  return utcDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z/, 'Z');
}

function buildEvents({ title, byDays, timeObj, location, instructor }) {
  const events = [];
  for (const byDay of byDays) {
    const weekdayNum = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'].indexOf(byDay);
    const firstDate = firstClassDateForWeekday(weekdayNum);

    const startArr = [
      firstDate.getFullYear(),
      firstDate.getMonth() + 1,
      firstDate.getDate(),
      timeObj.start[0],
      timeObj.start[1]
    ];
    const endArr = [
      firstDate.getFullYear(),
      firstDate.getMonth() + 1,
      firstDate.getDate(),
      timeObj.end[0],
      timeObj.end[1]
    ];

    events.push({
      title,
      start: startArr,
      end: endArr,
      location: location || '',
      description: `Instructor: ${instructor || 'TBA'}`,
      rrule: formatRRule({
        freq: 'WEEKLY',
        byday: [byDay],
        until: TERM_END
      })
    });
  }
  return events;
}

// Escape special characters in text fields
function escapeText(text) {
  if (!text) return '';
  return text
    .replace(/[\\;,]/g, '\\$&')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r');
}

export async function createIcs({ googleId, scheduleIndex = 0 }) {
  console.log('createIcs - Starting generation for:', { googleId, scheduleIndex });
  
  if (mongoose.connection.readyState === 0) {
    console.log('createIcs - Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
  }

  const user = await User.findOne({ googleId })
    .populate('schedules.type.course')
    .lean();

  if (!user) {
    console.log('createIcs - User not found:', googleId);
    throw new Error('User not found');
  }

  const schedule = user.schedules?.[scheduleIndex];
  if (!schedule || schedule.type.length === 0) {
    console.log('createIcs - Schedule not found or empty:', { scheduleIndex, hasSchedule: !!schedule });
    throw new Error('Schedule empty / not found');
  }

  console.log('createIcs - Building events for schedule with', schedule.type.length, 'courses');
  const events = [];

  for (const entry of schedule.type) {
    const course = entry.course;
    const discIdx = entry.discussion;

    console.log('createIcs - Processing course:', {
      course: course.course,
      section: course.section,
      day: course.day,
      time: course.time
    });

    const byDaysLec = parseByDay(course.day);
    const timeLec = parseTimeRange(course.time);

    if (byDaysLec && timeLec) {
      console.log('createIcs - Adding lecture:', {
        days: byDaysLec,
        time: timeLec
      });
      events.push(
        ...buildEvents({
          title: `${course.course} Lec ${course.section}`,
          byDays: byDaysLec,
          timeObj: timeLec,
          location: course.sectionLink,
          instructor: course.instructor
        })
      );
    }

    if (discIdx >= 0 && course.discussions?.[discIdx]) {
      const d = course.discussions[discIdx];
      const byDaysDis = parseByDay(d.day);
      const timeDis = parseTimeRange(d.time);

      if (byDaysDis && timeDis) {
        console.log('createIcs - Adding discussion:', {
          days: byDaysDis,
          time: timeDis
        });
        events.push(
          ...buildEvents({
            title: `${course.course} Dis ${d.section}`,
            byDays: byDaysDis,
            timeObj: timeDis,
            location: course.sectionLink,
            instructor: d.instructor
          })
        );
      }
    }
  }

  console.log('createIcs - Generated', events.length, 'total events');

  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BruinPlan//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:BruinPlan Schedule',
    'X-WR-TIMEZONE:UTC'
  ];

  for (const event of events) {
    const { start, end, title, location, description, rrule } = event;

    icsContent.push(
      'BEGIN:VEVENT',
      `DTSTART:${toUTCString(start)}`,
      `DTEND:${toUTCString(end)}`,
      `SUMMARY:${escapeText(title)}`,
      `LOCATION:${escapeText(location)}`,
      `DESCRIPTION:${escapeText(description)}`,
      'STATUS:CONFIRMED',
      'TRANSP:OPAQUE',
      `RRULE:${rrule}`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z/, 'Z')}`,
      `UID:${Date.now()}-${Math.random().toString(36).substring(2)}@bruinplan.com`,
      'SEQUENCE:0',
      'END:VEVENT'
    );
  }

  icsContent.push('END:VCALENDAR');

  // Ensure proper line endings and add final newline
  const finalContent = icsContent.join('\r\n') + '\r\n';
  
  // Validate content starts with BEGIN:VCALENDAR
  if (!finalContent.startsWith('BEGIN:VCALENDAR')) {
    console.error('createIcs - Invalid ICS format generated, content starts with:', finalContent.substring(0, 50));
    throw new Error('Invalid ICS format generated');
  }
  
  console.log('createIcs - Successfully generated ICS file of length:', finalContent.length);
  return finalContent;
}
