// src/pages/Schedules.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Schedules.css';

// === Sample data (your provided array) ===
const sampleSchedule = [
  {
    day: 'Tuesday, Thursday',
    timeValid: true,
    start: 11,
    end: 12.833333333333334,
    type: 'lecture',
    course: 'M107 - Cultural History of Rap',
    timeStr: '11am-12:50pm'
  },
  {
    day: 'Thursday',
    timeValid: true,
    start: 13,
    end: 13.833333333333334,
    type: 'discussion',
    course: 'M107 - Cultural History of Rap',
    section: 'Dis 1C',
    timeStr: '1pm-1:50pm'
  },
  {
    day: 'Wednesday',
    timeValid: true,
    start: 11,
    end: 13.833333333333334,
    type: 'lecture',
    course:
      '188A - Special Courses in African American Studies: Black Feminist Ethnography',
    timeStr: '11am-1:50pm'
  },
  {
    day: 'Thursday',
    timeValid: true,
    start: 14,
    end: 14.833333333333334,
    type: 'discussion',
    course:
      '188A - Special Courses in African American Studies: Black Feminist Ethnography',
    section: 'Dis 2C',
    timeStr: '2pm-2:50pm'
  },
  {
    day: 'Friday',
    timeValid: true,
    start: 13,
    end: 13.833333333333334,
    type: 'lecture',
    course: '20C - Team and Leadership Fundamentals',
    timeStr: '1pm-1:50pm'
  }
];

// Map each weekday name to its grid column number
const dayColumnMap = {
  Monday: 2,
  Tuesday: 3,
  Wednesday: 4,
  Thursday: 5,
  Friday: 6
};

export default function Schedules() {
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Auto-hide the "Saved to profile" toast after 3 seconds
  useEffect(() => {
    if (showSavedToast) {
      const timer = setTimeout(() => setShowSavedToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showSavedToast]);

  // Close profile dropdown when clicking outside
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

  const handleSaveClick = () => {
    setShowSavedToast(true);
    // (Optional) Insert server-save logic here
  };

  const handleProfileClick = () => {
    setDropdownOpen((prev) => !prev);
  };

  const goToSavedSchedules = () => {
    setDropdownOpen(false);
    navigate('/profile');
  };

  const handleSignOut = () => {
    setDropdownOpen(false);
    // (Optional) clear auth tokens or session here
    navigate('/');
  };

  return (
    <div className="schedules-container">
      {/* "BruinPlan" heading (clickable → /dashboard) */}
      <Link to="/dashboard" style={{ textDecoration: 'none' }}>
        <h1 className="schedules-title">BruinPlan</h1>
      </Link>

      {/* Profile icon + dropdown wrapper */}
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
      </div>

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
        {sampleSchedule.map((entry, idx) => {
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
              </div>
            );
          });
        })}
      </div>

      <button
          className="schedules-arrow-btn"
          onClick={() => alert('Next schedule clicked')}
        >
          &rarr;
        </button>

      {/* "SAVE" button */}
      <button className="schedules-save-button" onClick={handleSaveClick}>
        SAVE
      </button>
    </div>
  );
}
