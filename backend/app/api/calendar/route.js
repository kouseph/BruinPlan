import express from 'express';
import { addScheduleToGoogleCalendar } from '../../../services/calendar.service.js';

const router = express.Router();

router.post('/api/calendar', async (req, res) => {
  try {
    console.log('Calendar API - Request headers:', req.headers);
    console.log('Calendar API - Request body:', req.body);
    console.log('Calendar API - User session:', req.user);

    const { googleId, scheduleIndex = 0 } = req.body;

    if (!googleId) {
      console.error('Calendar API - Missing googleId');
      return res.status(400).json({ error: 'Missing googleId parameter' });
    }

    // Verify user is authenticated and matches the googleId
    if (!req.user || req.user.googleId !== googleId) {
      console.error('Calendar API - User authentication mismatch:', {
        requestGoogleId: googleId,
        sessionGoogleId: req.user?.googleId
      });
      return res.status(401).json({ error: 'User authentication failed' });
    }

    console.log('Calendar API - Starting calendar creation for user:', {
      googleId,
      scheduleIndex
    });

    const result = await addScheduleToGoogleCalendar(googleId, scheduleIndex);
    
    console.log('Calendar API - Success:', result);
    res.json({
      message: 'Schedule added to Google Calendar',
      calendarId: result.calendarId,
      eventCount: result.eventCount
    });
    
  } catch (err) {
    console.error('Calendar API - Error:', err);
    console.error('Calendar API - Error stack:', err.stack);

    // Determine the appropriate error response
    let statusCode = 500;
    let errorMessage = 'Failed to add schedule to Google Calendar';

    if (err.message.includes('User not found')) {
      statusCode = 404;
      errorMessage = 'User not found';
    } else if (err.message.includes('Schedule empty')) {
      statusCode = 400;
      errorMessage = 'Schedule not found or empty';
    } else if (err.message.includes('Missing OAuth tokens')) {
      statusCode = 401;
      errorMessage = 'Please log in again to refresh your Google Calendar access';
    } else if (err.message.includes('Google Calendar API Error')) {
      statusCode = 503;
      errorMessage = 'Google Calendar service error - please try again later';
    }

    res.status(statusCode).json({
      error: errorMessage,
      details: err.message
    });
  }
});

export default router; 