import mongoose from 'mongoose';
import { createEvents } from 'ics';
import Course from 'backend/models/course';
import User from 'backend/models/user';

// Spring 2025 Term
const TERM_START = new Date('2025-03-31');
const TERM_END = new Date('2025-06-06');

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

  const firstToken = timeStr.split(/\s+/)[0];
  const [startStr, endStr] = firstToken.split('-').map(s => s.trim());

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
  if (rruleObj.byday && rruleObj.byday.length > 0) {
    parts.push(`BYDAY=${rruleObj.byday.join(',')}`);
  }
  if (rruleObj.until) {
    parts.push(`UNTIL=${untilUTC(rruleObj.until)}`);
  }
  return parts.join(';');
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
      status: 'CONFIRMED',
      start: startArr,
      end: endArr,
      location: location || '',
      description: `Instructor: ${instructor || 'TBA'}`,
      calName: 'BruinPlan Schedule',
      busyStatus: 'BUSY',
      productId: '-//BruinPlan//EN',
      method: 'PUBLISH',
      sequence: 0,
      transparency: 'OPAQUE',
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
  if (!schedule || schedule.type.length === 0)
    throw new Error('Schedule empty / not found');

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

  // Generate proper iCalendar format according to RFC 5545
  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BruinPlan//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:BruinPlan Schedule',
    'X-WR-TIMEZONE:America/Los_Angeles'
  ];

  for (const event of events) {
    const { start, end, title, location, description, rrule } = event;
    const dtstart = `${start[0]}${String(start[1]).padStart(2, '0')}${String(start[2]).padStart(2, '0')}T${String(start[3]).padStart(2, '0')}${String(start[4]).padStart(2, '0')}00`;
    const dtend = `${end[0]}${String(end[1]).padStart(2, '0')}${String(end[2]).padStart(2, '0')}T${String(end[3]).padStart(2, '0')}${String(end[4]).padStart(2, '0')}00`;

    icsContent.push(
      'BEGIN:VEVENT',
      `DTSTART;TZID=America/Los_Angeles:${dtstart}`,
      `DTEND;TZID=America/Los_Angeles:${dtend}`,
      `SUMMARY:${title}`,
      `LOCATION:${location || ''}`,
      `DESCRIPTION:${description || ''}`,
      'STATUS:CONFIRMED',
      'TRANSP:OPAQUE',
      `RRULE:${rrule}`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`,
      `UID:${Math.random().toString(36).substring(2)}@bruinplan.com`,
      'SEQUENCE:0',
      'END:VEVENT'
    );
  }

  icsContent.push('END:VCALENDAR');
  return icsContent.join('\r\n') + '\r\n';
}
