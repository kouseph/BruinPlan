// src/pages/HomeSched.jsx
import React, { useState, useEffect,useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import './HomeSched.css';

// Map each weekday name to its grid column number
const dayColumnMap = {
  Monday: 2,
  Tuesday: 3,
  Wednesday: 4,
  Thursday: 5,
  Friday: 6
};

export default function HomeSched() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentScheduleIndex, setCurrentScheduleIndex] = useState(0);
  const [schedules, setSchedules] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [currentSchedule, setCurrentSchedule] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [showSavedToast, setShowSavedToast] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Set login status based on navigation source + API verification as fallback
  useEffect(() => {
    const from = location.state?.from;
    console.log('HomeSched - Navigation from:', from);
    
    // Primary check: navigation source
    if (from === 'dashboard') {
      setIsLoggedIn(true);
      console.log('Is logged in: true (from dashboard)');
    } else if (from === 'home') {
      setIsLoggedIn(false);
      console.log('Is logged in: false (from home)');
    } else {
      // Fallback: check actual auth status if navigation source is unclear
      console.log('Navigation source unclear, checking API auth status');
      const checkAuthStatus = async () => {
        try {
          const response = await fetch('http://localhost:3000/api/user', {
            method: 'GET',
            credentials: 'include',
          });
          const authStatus = response.ok;
          setIsLoggedIn(authStatus);
          console.log('Is logged in:', authStatus, '(from API check)');
        } catch (error) {
          console.log('API auth check failed, assuming not logged in');
          setIsLoggedIn(false);
        }
      };
      checkAuthStatus();
    }
  }, [location.state]);

  useEffect(() => {
    if (showSavedToast) {
      const timer = setTimeout(() => setShowSavedToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showSavedToast]);

  useEffect(() => {
    // Get schedule data from navigation state
    const state = location.state;
    
    if (state && state.schedules && state.selectedCourses) {
      setSchedules(state.schedules);
      setSelectedCourses(state.selectedCourses);
      
      // Set the first schedule as current
      if (state.schedules.length > 0) {
        setCurrentSchedule(state.schedules[0] || []);
      }
    } else {
      // If no schedule data, redirect back to home
      console.log('No schedule data found, redirecting to home');
      navigate('/', { replace: true });
    }
  }, [location.state, navigate]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleScheduleChange = (index) => {
    setCurrentScheduleIndex(index);
    setCurrentSchedule(schedules[index] || []);
  };

  const handleSaveClick = async () => {
    // Login status is determined by navigation source (dashboard = logged in, home = not logged in)
    console.log('Location state:', location.state);
    console.log('Is logged in?', isLoggedIn);
    
    if (!isLoggedIn) {
      console.log('Not logged in (came from home), redirecting to login');
      navigate('/login', { state: { showLoginRequired: true } });
    } else {
      setShowSavedToast(true);
    try {
      const response = await fetch('http://localhost:3000/api/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // 🔐 send cookies (required for sessions)
        body: JSON.stringify({
          schedule: currentSchedule, // replace with actual schedule data
        }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        console.log('✅ Schedule saved:', data);
      } else {
        console.error('❌ Error:', data.message);
      }
    } catch (err) {
      console.error('🚨 Network error:', err);
    }
    //   try {
    //     console.log('Attempting to save schedule:', currentSchedule);
    //     const response = await fetch('http://localhost:3000/api/schedules', {
    //       method: 'POST',
    //       headers: {
    //         'Content-Type': 'application/json'
    //       },
    //       credentials: 'include',
    //       body: JSON.stringify({
    //         schedule: currentSchedule
    //       })
    //     });

    //     if (response.ok) {
    //       const data = await response.json();
    //       console.log('Save successful:', data);
    //       alert('Schedule saved successfully!');
    //     } else {
    //       let errorMessage;
    //       try {
    //         const errorData = await response.json();
    //         errorMessage = errorData.message;
    //       } catch (e) {
    //         // If response is not JSON
    //         errorMessage = await response.text();
    //       }
    //       console.error('Save failed:', {
    //         status: response.status,
    //         statusText: response.statusText,
    //         error: errorMessage
    //       });
    //       alert(`Failed to save schedule: ${errorMessage || 'Unknown error'}`);
    //     }
    //   } catch (error) {
    //     console.error('Network error:', error);
    //     alert('Failed to save schedule. Please check your connection and try again.');
    //   }
    }
  };

  const handleProfileClick = () => {
    setDropdownOpen((prev) => !prev);
  };

  const goToSavedSchedules = () => {
    setDropdownOpen(false);
    navigate('/profile');
  };

  const handleSignOut = async () => {
    setDropdownOpen(false);
    
    try {
      // Call backend logout endpoint to clear session
      await fetch('http://localhost:3000/logout', {
        method: 'POST',
        credentials: 'include', // Include cookies so backend can clear them
      });
    } catch (error) {
      console.error('Logout request failed:', error);
      // Continue with local cleanup even if backend call fails
    }
    
    // Clear authentication state locally
    setIsLoggedIn(false);
    // Clear any localStorage items
    localStorage.removeItem("isLoggedIn");
    localStorage.clear(); // Clear all localStorage to be safe
    
    // Navigate to home with logout flag to prevent auth redirect loop
    navigate('/', { state: { justLoggedOut: true } });
  };

  const handleBackToPlanning = () => {
    const from = location.state?.from;
    if (from === 'dashboard') {
      navigate('/dashboard');
    } else {
      navigate('/');
    }
  };

  // // Show loading if no schedule data yet
  // if (schedules.length === 0) {
  //   return (
  //     <div className="schedules-container">
  //       <Link to="/" style={{ textDecoration: 'none' }}>
  //         <h1 className="schedules-title">BruinPlan</h1>
  //       </Link>
  //       <div className="loading-message">
  //         Loading your schedule...
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="schedules-container">
      {/* "BruinPlan" title links to "/" */}
      <Link to="/" style={{ textDecoration: 'none' }}>
        <h1 className="schedules-title">BruinPlan</h1>
      </Link>

      {isLoggedIn &&
      <div className="profile-icon-wrapper" ref={dropdownRef}>
        <img
          className="schedules-profile-icon"
          src="https://cdn-icons-png.flaticon.com/512/1946/1946429.png"
          alt="Profile"
          onClick={handleProfileClick}
        />
        {dropdownOpen && (
          <div className="profile-popup-menu">
            <button onClick={goToSavedSchedules}>Saved Schedules</button>
            <button onClick={handleSignOut}>Sign Out</button>
          </div>
        )}
      </div>}
      {/* Toast notification (appears in top-right) */}
      {showSavedToast && (
        <div className="schedules-toast">
          <span className="schedules-toast-icon">
            <svg width="24" height="24" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="12" fill="#4CAF50" />
              <path
                d="M9 12l2 2 4-4"
                stroke="#fff"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="schedules-toast-text">Saved to profile</span>
        </div>
      )}

      {/* Schedule Selection */}
      {schedules.length > 1 && (
        <div className="schedule-selector">
          <h3>Generated Schedules ({schedules.length} options)</h3>
          <div className="schedule-options">
            {schedules.map((schedule, index) => (
              <button
                key={index}
                className={`schedule-option ${index === currentScheduleIndex ? 'active' : ''}`}
                onClick={() => handleScheduleChange(index)}
              >
                Option {index + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Course Summary */}
      <div className="course-summary">
        <h3>Selected Courses:</h3>
        <div className="course-list">
          {selectedCourses.map((course, index) => (
            <span key={course._id || index} className="course-chip">
              {course.fullTitle || course.course}
            </span>
          ))}
        </div>
      </div>

      {/* ====================== */}
      {/* Weekly Timetable Grid */}
      {/* ====================== */}
      <div className="timetable-grid">
        {/* Header row: empty top-left + Monday–Friday */}
        <div className="grid-header empty-cell" />
        <div className="grid-header">Monday</div>
        <div className="grid-header">Tuesday</div>
        <div className="grid-header">Wednesday</div>
        <div className="grid-header">Thursday</div>
        <div className="grid-header">Friday</div>

        {/* Rows 2–11: Time labels (8 AM–5 PM) + 5 empty cells each row */}
        {Array.from({ length: 13 }).flatMap((_, rowIdx) => {
          const hour = 8 + rowIdx;
          let label;
          if (hour < 12) {
            label = `${hour} AM`;
          } else if (hour === 12) {
            label = `12 PM`;
          } else {
            label = `${hour - 12} PM`;
          }
          return [
            <div
              key={`time-${rowIdx}`}
              className="time-label"
              style={{ gridColumn: 1, gridRow: rowIdx + 2 }}
            >
              {label}
            </div>,
            ...Array.from({ length: 5 }, (_, colIdx) => (
              <div
                key={`empty-${rowIdx}-${colIdx}`}
                className="grid-cell"
                style={{ gridColumn: colIdx + 2, gridRow: rowIdx + 2 }}
              />
            ))
          ];
        })}

        {/* Render each event block in its proper day & time */}
        {currentSchedule.map((entry, idx) => {
          if (!entry.timeValid) return null; // Skip invalid time entries
          
          // "Tuesday, Thursday" → ['Tuesday','Thursday']
          const days = entry.day.split(',').map((d) => d.trim());
          // Round start/end to nearest whole hour:
          const startHour = Math.floor(entry.start);
          const endHour = Math.ceil(entry.end);
          // Convert hour to grid rows: 
          // 8 AM → row 2  (8–6=2), 9 AM → row 3, 10 AM → row 4, 11 AM → row 5, 12 PM → row 6, 1 PM → row 7, etc.
          const gridRowStart = startHour - 6;
          let gridRowEnd = endHour - 6;
          // Make sure it does not exceed row 11:
          if (gridRowEnd > 11) gridRowEnd = 11;

          return days.map((dayName) => {
            const col = dayColumnMap[dayName];
            if (!col) return null; // skip if not Mon–Fri
            return (
              <div
                key={`${idx}-${dayName}`}
                className={`event-block ${entry.type}`}
                style={{
                  gridColumn: col,
                  gridRowStart: gridRowStart,
                  gridRowEnd: gridRowEnd
                }}
              >
                <div className="event-course">{entry.course}</div>
                {entry.section && (
                  <div className="event-section">{entry.section}</div>
                )}
                <div className="event-time">{entry.timeStr}</div>
              </div>
            );
          });
        }).flat()}

        {/* Empty Schedule Message - Now inside the grid for overlay */}
        {currentSchedule.length === 0 && (
          <div className="empty-schedule-message">
            <h3>No valid schedule could be generated</h3>
            <p>There may be time conflicts between your selected courses.</p>
            <button className="back-button" onClick={handleBackToPlanning}>
              ← Try Different Courses
            </button>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button className="schedules-save-button" onClick={handleSaveClick}>
          SAVE SCHEDULE
        </button>
      </div>
    </div>
  );
}
