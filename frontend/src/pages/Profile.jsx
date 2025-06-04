// src/pages/Profile.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import MiniSchedule from '../components/MiniSchedule';
import './Profile.css';

// Import sample schedule data
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
    course: '188A - Special Courses in African American Studies',
    timeStr: '11am-1:50pm'
  },
  {
    day: 'Thursday',
    timeValid: true,
    start: 14,
    end: 14.833333333333334,
    type: 'discussion',
    course: '188A - Special Courses in African American Studies',
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

export default function Profile() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
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

  const handleProfileClick = () => {
    setDropdownOpen((prev) => !prev);
  };

  const handleSignOut = () => {
    setDropdownOpen(false);
    navigate('/');
  };

  return (
    <div className="profile-container">
      {/* "BruinPlan" title now links to "/dashboard" */}
      <Link to="/dashboard" style={{ textDecoration: 'none' }}>
        <h1 className="profile-title">BruinPlan</h1>
      </Link>

      {/* Profile icon + dropdown wrapper */}
      <div className="profile-icon-wrapper" ref={dropdownRef}>
        <img
          className="profile-icon"
          src="https://cdn-icons-png.flaticon.com/512/1946/1946429.png"
          alt="Profile"
          onClick={handleProfileClick}
        />
        {dropdownOpen && (
          <div className="profile-popup-menu">
            <button onClick={handleSignOut}>Sign Out</button>
          </div>
        )}
      </div>

      <div className="profile-content">
        <div className="profile-divider" />

        <div className="profile-main">
          {/* Display four cards with sample schedules */}
          {[...Array(4)].map((_, index) => (
            <div key={index} className="profile-card">
              <MiniSchedule schedule={sampleSchedule} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
