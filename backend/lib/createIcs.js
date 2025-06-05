import mongoose from 'mongoose';
import User from 'backend/models/user.js';
import Course from 'backend/models/course.js';

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

function firstClassDateForWeekday(weekday) {
  const d = new Date(TERM_START);
  while (d.getDay() !== weekday) d.setDate(d.getDate() + 1);
  return new Date(d);
}

function untilUTC(date) {
  const z = n => String(n).padStart(2, '0');
  const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59));
  return `${utc.getUTCFullYear()}${z(utc.getUTCMonth() + 1)}${z(utc.getUTCDate())}T${z(
    utc.getUTCHours()
  )}${z(utc.getUTCMinutes())}${z(utc.getUTCSeconds())}Z`;
}

function formatRRule(rruleObj) {
  const parts = [`FREQ=${rruleObj.freq.toUpperCase()}`];
  if (rruleObj.byday?.length > 0) parts.push(`BYDAY=${rruleObj.byday.join(',')}`);
  if (rruleObj.until) parts.push(`UNTIL=${untilUTC(rruleObj.until)}`);
  return parts.join(';');
}

function toUTCString([y, m, d, h, min]) {
  const utcDate = new Date(Date.UTC(y, m - 1, d, h, min, 0));
  return utcDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z/, 'Z');
}

function escapeText(text) {
  if (!text) return '';
  return text
    .replace(/[\\;,]/g, '\\$&')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r');
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

export async function createIcs({ googleId, scheduleIndex = 0 }) {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI);
  }

  const user = await User.findOne({ googleId })
    .populate('schedules.type.course')
    .lean();

  if (!user) throw new Error('User not found');
  const schedule = user.schedules?.[scheduleIndex];
  if (!schedule || schedule.type.length === 0) throw new Error('Schedule empty / not found');

  const events = [];

  for (const entry of schedule.type) {
    const course = entry.course;
    const discIdx = entry.discussion;

    const byDaysLec = parseByDay(course.day);
    const timeLec = parseTimeRange(course.time);

    if (byDaysLec && timeLec) {
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

  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BruinPlan//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:BruinPlan Schedule',
    'X-WR-TIMEZONE:UTC'
  ];

  for (const e of events) {
    icsLines.push(
      'BEGIN:VEVENT',
      `DTSTART:${toUTCString(e.start)}`,
      `DTEND:${toUTCString(e.end)}`,
      `SUMMARY:${escapeText(e.title)}`,
      `LOCATION:${escapeText(e.location)}`,
      `DESCRIPTION:${escapeText(e.description)}`,
      `STATUS:CONFIRMED`,
      `TRANSP:OPAQUE`,
      `RRULE:${e.rrule}`,
      `DTSTAMP:${toUTCString(new Date().toISOString().split(/[-T:]/).map(Number))}`,
      `UID:${Date.now()}-${Math.random().toString(36).substring(2)}@bruinplan.com`,
      'SEQUENCE:0',
      'END:VEVENT'
    );
  }

  icsLines.push('END:VCALENDAR');
  return icsLines.join('\r\n') + '\r\n';
}
