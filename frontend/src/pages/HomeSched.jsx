// src/pages/HomeSched.jsx
import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import './HomeSched.css';

// === Sample data (same as Schedules.jsx) ===
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

export default function HomeSched() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleSaveClick = () => {
    // Check if we came from the dashboard (logged in) or home (not logged in)
    const isLoggedIn = location.state?.from === 'dashboard';
    
    if (!isLoggedIn) {
      navigate('/login', { state: { showLoginRequired: true } });
    } else {
      alert('Schedule saved successfully!');
      // Add your save logic here
    }
  };

  return (
    <div className="schedules-container">
      {/* "BruinPlan" title links to "/" */}
      <Link to="/" style={{ textDecoration: 'none' }}>
        <h1 className="schedules-title">BruinPlan</h1>
      </Link>

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
        }).flat()}
      </div>

      {/* "SAVE" button */}
      <button className="schedules-save-button" onClick={handleSaveClick}>
        SAVE
      </button>
    </div>
  );
}
