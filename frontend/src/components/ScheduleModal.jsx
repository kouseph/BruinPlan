import React, { useState } from 'react';
import MiniSchedule from './MiniSchedule';
import './ScheduleModal.css';

export default function ScheduleModal({ schedule, onClose, googleId, scheduleIndex = 0 }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleModalClick = (e) => {
    e.stopPropagation(); // Prevent modal from closing on internal click
  };

  const handleAddToCalendar = async () => {
    setIsLoading(true);
    setError(null);

    if (!googleId) {
      setError('User not authenticated. Please log in again.');
      setIsLoading(false);
      handleReauthentication();
      return;
    }

    try {
      console.log('Sending calendar request:', { googleId, scheduleIndex });
      
      const res = await fetch('http://localhost:3000/api/calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ googleId, scheduleIndex }),
        credentials: 'include'
      });

      // Log the response for debugging
      console.log('Response status:', res.status);
      const text = await res.text();
      console.log('Response text:', text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('Failed to parse response:', e);
        throw new Error('Invalid response from server');
      }

      if (!res.ok) {
        // Handle specific error cases
        switch (res.status) {
          case 401:
            throw new Error('Please log in again to refresh your Google Calendar access');
          case 404:
            throw new Error('User account not found. Please log in again.');
          case 400:
            throw new Error('Schedule not found or empty. Please try again.');
          case 503:
            throw new Error('Google Calendar service is temporarily unavailable. Please try again later.');
          default:
            throw new Error(data.error || 'Failed to add to Google Calendar');
        }
      }

      alert(`Successfully added ${data.eventCount} events to your Google Calendar!`);
      onClose();
    } catch (err) {
      console.error('Calendar error:', err);
      setError(err.message);
      
      // If the error is about authentication, trigger re-authentication
      if (err.message.includes('log in again') || err.message.includes('not found')) {
        handleReauthentication();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReauthentication = () => {
    // Store current state in localStorage
    localStorage.setItem('pendingCalendarAction', JSON.stringify({
      scheduleIndex,
      returnTo: window.location.pathname
    }));

    // Redirect to Google OAuth with calendar scope
    setTimeout(() => {
      window.location.href = 'http://localhost:3000/google';
    }, 2000);
  };

  const handleDeleteClick = async (index) => {
    try {
      const response = await fetch(`http://localhost:3000/api/schedules/${index}`, {
        method: 'DELETE',
        credentials: 'include', // ensures session cookie is sent
      });
  
      const data = await response.json();
  
      if (response.ok) {
        console.log('✅ Schedule deleted:', data.schedules);
        // Optionally update state to reflect deletion:
        // setSchedules(data.schedules);
      } else {
        console.error('❌ Delete failed:', data.message);
      }
    } catch (error) {
      console.error('🚨 Network error:', error);
    }
    window.location.reload();
  };
  

  return (
    <div className="schedule-modal-overlay" onClick={onClose}>
      <div className="schedule-modal-content" onClick={handleModalClick}>
        <div className="full-schedule">
          <MiniSchedule schedule={schedule} />
        </div>
        {error && (
          <div className="error-message">
            {error}
            {(error.includes('log in again') || error.includes('not found')) && (
              <div className="error-submessage">
                Redirecting to Google login in 2 seconds...
              </div>
            )}
          </div>
        )}
        <div className="modal-buttons">
          <button 
            className="export-button" 
            onClick={handleAddToCalendar}
            disabled={isLoading}
          >
            {isLoading ? 'Adding to Calendar...' : 'Add to Google Calendar'}
          </button>
          <button className="delete-button" onClick={() => handleDeleteClick(scheduleIndex)}>
            Delete Schedule
          </button>
        </div>
      </div>
    </div>
  );
}
