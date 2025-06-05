// Based on "app" router (added in Next 13)
// Does not work on ≤ Next 12

import mongoose from 'mongoose';
import { createEvents } from 'ics';
import Course from 'backend/models/course';
import User   from 'backend/models/user';

// Spring 2025 Term
const TERM_START = new Date('2025-03-31');
const TERM_END   = new Date('2025-06-06');

/* =====================  Helper: Day parser  ===================== */
/*
    "(No day)" or "Varies: Consult Instructor" → null
    "Monday, Friday<br />Tuesday, Wednesday"   → ['MO','TU','WE','TH','FR']
    "Monday, Wednesday"                        → ['MO','WE']
*/
function parseByDay(dayStr = '') {
  dayStr = dayStr.trim();

  // asynchronous variants
  if (
    dayStr === '(No day)' ||
    dayStr.length === 0 ||
    dayStr.startsWith('Varies')
  )
    return null;

  // every-weekday variant
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

/* =====================  Helper: Time parser  ==================== */
/*
    "(No time)"                          → null
    "1pm-1:50pm 1pm-1:50pm"   → {start:[13,0], end:[13,50]}
    "11:30am-1pm"             → {start:[11,30], end:[13,0]}
*/
function parseTimeRange(timeStr = '') {
  timeStr = timeStr.trim();

  if (timeStr === '(No time)' || !timeStr) return null;

  // duplicated token? keep the first
  const firstToken = timeStr.split(/\s+/)[0]; // up to first whitespace
  const [startStr, endStr] = firstToken.split('-').map(s => s.trim());

  const to24 = s => {
    // matches "12pm" "1:50pm" etc.
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

/* ================= Helper: first class date ==================== */
function firstClassDateForWeekday(weekday /*0-Sun..6-Sat*/) {
  const d = new Date(TERM_START);
  while (d.getDay() !== weekday) d.setDate(d.getDate() + 1);
  return new Date(d); // clone
}

/* ================= Helper: UNTIL (RFC-5545) ==================== */
function untilUTC(date) {
  const z = n => String(n).padStart(2, '0');
  const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59));
  return `${utc.getUTCFullYear()}${z(utc.getUTCMonth() + 1)}${z(utc.getUTCDate())}T${z(
    utc.getUTCHours()
  )}${z(utc.getUTCMinutes())}${z(utc.getUTCSeconds())}Z`;
}

/* ================= Helper: format RRULE ======================= */
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

/* ================= Helper: event builder ======================= */
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

/* ==========================  Main API  ========================= */
export async function createIcs({ googleId, scheduleIndex = 0 }) {
  /* 1. connect tot DB (reuse existing connection in lambda/next) */
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI);
  }

  /* 2. fetch user + schedule */
  const user = await User.findOne({ googleId })
    .populate('schedules.type.course')
    .lean();

  if (!user) throw new Error('User not found');

  const schedule = user.schedules?.[scheduleIndex];
  if (!schedule || schedule.type.length === 0)
    throw new Error('Schedule empty / not found');

  /* 3. build events */
  const events = [];

  for (const entry of schedule.type) {
    const course = entry.course;
    const discIdx = entry.discussion;

    /* ---------- lecture ---------- */
    const byDaysLec = parseByDay(course.day);
    const timeLec   = parseTimeRange(course.time);

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

    /* ---------- discussion ------- */
    if (discIdx >= 0 && course.discussions?.[discIdx]) {
      const d = course.discussions[discIdx];
      const byDaysDis = parseByDay(d.day);
      const timeDis   = parseTimeRange(d.time);

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

  /* 4. generate ics text */
  const { error, value } = createEvents({
    events,
    calendarMethod: 'PUBLISH',
    productId: '-//BruinPlan//EN',
    timezone: 'America/Los_Angeles',
    title: 'BruinPlan Schedule',
    description: 'Class schedule exported from BruinPlan',
    scale: 'GREGORIAN',
    version: '2.0'
  });
  
  if (error) throw error;
  return value; // raw .ics string
}