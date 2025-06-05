import { google } from 'googleapis';
import { getUserByGoogleId } from './user.service.js';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:3000/google/callback'
);

const calendar = google.calendar('v3');

// Convert time string to RFC3339 format
const toRFC3339 = (date) => {
  return date.toISOString();
};

// Quarter dates for Spring 2025
const QUARTER_DATES = {
  START: new Date(2025, 2, 31), // March 31, 2025 (First day of instruction)
  END: new Date(2025, 5, 13),   // June 13, 2025 (End of quarter)
  FINALS_WEEK: {
    START: new Date(2025, 5, 9), // June 9, 2025
    END: new Date(2025, 5, 13)   // June 13, 2025
  }
};

// Get first class date for a given weekday
const firstClassDateForWeekday = (weekdayNum) => {
  // Always start from March 31, 2025 (First day of instruction)
  const quarterStart = new Date(2025, 2, 31); // Month is 0-based, so 2 = March
  const currentDay = quarterStart.getDay(); // Monday = 1
  
  // Calculate days until first occurrence of the target weekday
  const daysUntilTarget = (weekdayNum - currentDay + 7) % 7;
  const firstDate = new Date(quarterStart);
  firstDate.setDate(quarterStart.getDate() + daysUntilTarget);
  
  return firstDate;
};

// Get final exam date for a course
const getFinalExamDate = (course, weekdayNum, startTime) => {
  // This is a simplified version - you might want to implement actual UCLA final exam scheduling rules
  const finalsStart = QUARTER_DATES.FINALS_WEEK.START;
  const finalsEnd = QUARTER_DATES.FINALS_WEEK.END;
  
  // For now, schedule the final on the same weekday during finals week
  const currentDay = finalsStart.getDay();
  const daysUntilTarget = (weekdayNum - currentDay + 7) % 7;
  const finalDate = new Date(finalsStart);
  finalDate.setDate(finalsStart.getDate() + daysUntilTarget);
  
  // If the calculated date is after finals week, move it to an earlier day
  if (finalDate > finalsEnd) {
    finalDate.setDate(finalDate.getDate() - 7);
  }
  
  // Set the same time as the regular class
  finalDate.setHours(startTime[0], startTime[1], 0);
  
  return finalDate;
};

// Parse day string to array of weekdays
const parseByDay = (dayStr) => {
  if (!dayStr) return null;

  // Create a mapping for day abbreviations
  const dayMap = {
    'monday': 'MO',
    'mon': 'MO',
    'tuesday': 'TU',
    'tue': 'TU',
    'wednesday': 'WE',
    'wed': 'WE',
    'thursday': 'TH',
    'thu': 'TH',
    'friday': 'FR',
    'fri': 'FR'
  };

  // Split the string and convert each day
  const days = dayStr.toLowerCase().split(/[,\s]+/).filter(Boolean);
  const convertedDays = days.map(day => dayMap[day]);

  // Check if all days were converted successfully
  if (convertedDays.some(day => !day)) {
    console.warn('Invalid day in string:', dayStr);
    return null;
  }

  return convertedDays;
};

// Parse time range string to object with start and end times
const parseTimeRange = (timeStr) => {
  if (!timeStr) return null;
  
  // Try to parse the timeStr format (e.g., "11am-12:50pm")
  const match = timeStr.match(/(\d+)(?::(\d+))?\s*(am|pm)?-(\d+)(?::(\d+))?\s*(am|pm)/i);
  if (!match) {
    console.warn('Invalid time format:', timeStr);
    return null;
  }

  const [
    ,
    startHour,
    startMin = '0',
    startMeridiem,
    endHour,
    endMin = '0',
    endMeridiem
  ] = match;

  // Convert to 24-hour format
  let start = parseInt(startHour);
  if (startMeridiem && startMeridiem.toLowerCase() === 'pm' && start !== 12) {
    start += 12;
  } else if (startMeridiem && startMeridiem.toLowerCase() === 'am' && start === 12) {
    start = 0;
  }

  let end = parseInt(endHour);
  if (endMeridiem && endMeridiem.toLowerCase() === 'pm' && end !== 12) {
    end += 12;
  } else if (endMeridiem && endMeridiem.toLowerCase() === 'am' && end === 12) {
    end = 0;
  }

  return {
    start: [start, parseInt(startMin)],
    end: [end, parseInt(endMin)]
  };
};

export const addScheduleToGoogleCalendar = async (googleId, scheduleIndex = 0) => {
  console.log('Starting addScheduleToGoogleCalendar:', { googleId, scheduleIndex });
  
  try {
    const user = await getUserByGoogleId(googleId);
    if (!user) {
      console.error('User not found:', googleId);
      throw new Error('User not found');
    }

    console.log('Found user:', { 
      name: user.name, 
      email: user.email,
      hasAccessToken: !!user.accessToken,
      hasRefreshToken: !!user.refreshToken
    });

    const schedule = user.schedules?.[scheduleIndex];
    console.log('Raw schedule data:', JSON.stringify(schedule, null, 2));

    if (!schedule || !Array.isArray(schedule) || schedule.length === 0) {
      console.error('Invalid schedule:', { scheduleIndex, schedule });
      throw new Error('Schedule empty / not found');
    }

    console.log('Found schedule with', schedule.length, 'entries');

    // Set up OAuth2 client with user's tokens
    if (!user.accessToken || !user.refreshToken) {
      console.error('Missing tokens:', { 
        hasAccessToken: !!user.accessToken, 
        hasRefreshToken: !!user.refreshToken 
      });
      throw new Error('Missing OAuth tokens - please re-authenticate');
    }

    oauth2Client.setCredentials({
      access_token: user.accessToken,
      refresh_token: user.refreshToken
    });

    console.log('OAuth client configured');

    try {
      // Create a new calendar for the schedule
      console.log('Creating new calendar...');
      const calendarResponse = await calendar.calendars.insert({
        auth: oauth2Client,
        requestBody: {
          summary: `Spring 2025 Schedule ${scheduleIndex + 1}`,
          timeZone: 'America/Los_Angeles'
        }
      });

      const calendarId = calendarResponse.data.id;
      console.log('Created calendar:', calendarId);

      const calendarEvents = [];

      // Process each course in the schedule
      for (const entry of schedule) {
        console.log('Processing schedule entry:', {
          course: entry.course,
          type: entry.type,
          day: entry.day,
          timeStr: entry.timeStr
        });

        // Skip invalid entries
        if (!entry.course || !entry.day || !entry.timeStr) {
          console.warn('Skipping invalid entry:', entry);
          continue;
        }

        // Handle lecture events
        const byDaysLec = parseByDay(entry.day);
        const timeLec = parseTimeRange(entry.timeStr);

        if (!byDaysLec || !timeLec) {
          console.warn('Invalid day or time format:', { 
            day: entry.day, 
            time: entry.timeStr,
            parsedDays: byDaysLec,
            parsedTime: timeLec 
          });
          continue;
        }

        console.log('Parsed schedule data:', {
          days: byDaysLec,
          time: timeLec
        });

        for (const byDay of byDaysLec) {
          const weekdayMap = {
            'MO': 1, // Monday
            'TU': 2,
            'WE': 3,
            'TH': 4,
            'FR': 5,
            'SA': 6,
            'SU': 7
          };
          
          const weekdayNum = weekdayMap[byDay];
          if (!weekdayNum) {
            console.warn('Invalid weekday:', byDay);
            continue;
          }

          const firstDate = firstClassDateForWeekday(weekdayNum);

          // Set start and end times for regular classes
          const startDate = new Date(firstDate);
          startDate.setHours(timeLec.start[0], timeLec.start[1], 0);
          const endDate = new Date(firstDate);
          endDate.setHours(timeLec.end[0], timeLec.end[1], 0);

          // Create regular class event
          const classEvent = {
            auth: oauth2Client,
            calendarId: calendarId,
            requestBody: {
              summary: `${entry.course} ${entry.type === 'discussion' ? `Dis ${entry.section}` : 'Lec'}`,
              location: entry.location || '',
              description: `Course Type: ${entry.type}\nQuarter: Spring 2025\n${entry.instructor ? `Instructor: ${entry.instructor}` : ''}`,
              start: {
                dateTime: toRFC3339(startDate),
                timeZone: 'America/Los_Angeles'
              },
              end: {
                dateTime: toRFC3339(endDate),
                timeZone: 'America/Los_Angeles'
              },
              recurrence: [
                `RRULE:FREQ=WEEKLY;UNTIL=20250606T235959Z` // End of instruction (June 6, 2025)
              ]
            }
          };

          // Add regular class event
          calendarEvents.push(calendar.events.insert(classEvent));

          // Create final exam event if it's a lecture
          if (entry.type !== 'discussion') {
            const finalDate = getFinalExamDate(entry.course, weekdayNum, timeLec.start);
            const finalEndDate = new Date(finalDate);
            finalEndDate.setHours(finalDate.getHours() + 3); // Finals are typically 3 hours

            const finalEvent = {
              auth: oauth2Client,
              calendarId: calendarId,
              requestBody: {
                summary: `${entry.course} Final Exam`,
                location: entry.location || '',
                description: `Final Examination for ${entry.course}\n${entry.instructor ? `Instructor: ${entry.instructor}` : ''}`,
                start: {
                  dateTime: toRFC3339(finalDate),
                  timeZone: 'America/Los_Angeles'
                },
                end: {
                  dateTime: toRFC3339(finalEndDate),
                  timeZone: 'America/Los_Angeles'
                }
              }
            };

            // Add final exam event
            calendarEvents.push(calendar.events.insert(finalEvent));
          }
        }
      }

      // Create all events in parallel
      console.log('Creating', calendarEvents.length, 'events...');
      await Promise.all(calendarEvents);
      console.log('Successfully created all events');

      return {
        calendarId,
        eventCount: calendarEvents.length
      };

    } catch (error) {
      console.error('Google Calendar API Error:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      throw new Error(`Google Calendar API Error: ${error.message}`);
    }
  } catch (error) {
    console.error('Calendar Service Error:', error);
    throw error;
  }
}; 