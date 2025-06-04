// src/pages/Schedules.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Schedules.css';

// Sample data (replace or feed from props/server as needed)
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
    course: '188A - Special Courses in African American Studies: Black Feminist Ethnography',
    timeStr: '11am-1:50pm'
  },
  {
    day: 'Thursday',
    timeValid: true,
    start: 14,
    end: 14.833333333333334,
    type: 'discussion',
    course: '188A - Special Courses in African American Studies: Black Feminist Ethnography',
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

export default function Schedules() {
  const [showSavedToast, setShowSavedToast] = useState(false);

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (showSavedToast) {
      const timer = setTimeout(() => setShowSavedToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showSavedToast]);

  const handleSaveClick = () => {
    setShowSavedToast(true);
    // (Optional) actual “save to profile” logic goes here
  };

  return (
    <div className="schedules-container">
      {/* “BruinPlan” title links back to Dashboard */}
      <Link to="/dashboard" style={{ textDecoration: 'none' }}>
        <h1 className="schedules-title">BruinPlan</h1>
      </Link>

      {/* Profile icon (top-right) */}
      <Link to="/profile">
        <img
          className="schedules-profile-icon"
          src="https://cdn-icons-png.flaticon.com/512/1946/1946429.png"
          alt="Profile"
        />
      </Link>

      {/* Toast notification (top-right) */}
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

      {/* Main content: gray rectangle with schedule list + arrow */}
      <div className="schedules-main">
        <div className="schedules-rect">
          <div className="schedules-list">
            {sampleSchedule.map((entry, idx) => (
              <div key={idx} className="schedules-item">
                <div className="item-time">{entry.timeStr}</div>
                <div className="item-details">
                  <div className="item-course">{entry.course}</div>
                  {entry.section && (
                    <div className="item-section">{entry.section}</div>
                  )}
                  <div className="item-day">{entry.day}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          className="schedules-arrow-btn"
          onClick={() => alert('Next schedule clicked')}
        >
          &rarr;
        </button>
      </div>

      {/* “SAVE” button */}
      <button className="schedules-save-button" onClick={handleSaveClick}>
        SAVE
      </button>
    </div>
  );
}
