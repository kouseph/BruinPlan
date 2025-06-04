// src/pages/Selected.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Selected.css';

export default function Selected() {
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
    setDropdownOpen(prev => !prev);
  };

  const goToSavedSchedules = () => {
    setDropdownOpen(false);
    navigate('/schedules');
  };

  const handleSignOut = () => {
    setDropdownOpen(false);
    navigate('/');
  };

  return (
    <div className="selected-container">
      {/* “BruinPlan” title now links to "/dashboard" */}
      <Link to="/dashboard" style={{ textDecoration: 'none' }}>
        <h1 className="selected-title">BruinPlan</h1>
      </Link>

      {/* Profile icon + dropdown wrapper */}
      <div className="profile-icon-wrapper" ref={dropdownRef}>
        <img
          className="selected-profile-icon"
          src="https://cdn-icons-png.flaticon.com/512/1946/1946429.png"
          alt="Profile"
          onClick={handleProfileClick}
        />
        {dropdownOpen && (
          <div className="profile-popup-menu">
            <button className="dropdown-item" onClick={goToSavedSchedules}>
              Saved Schedules
            </button>
            <button className="dropdown-item" onClick={handleSignOut}>
              Sign Out
            </button>
          </div>
        )}
      </div>

      {/* Centered heading */}
      <h2 className="selected-heading">Selected Schedule</h2>

      <div className="selected-rect" />

      {/* “Import to Google Calendar” button */}
      <button
        className="selected-button"
        onClick={() => {
          alert('Importing to Google Calendar...');
        }}
      >
        Import to Google Calendar
      </button>
    </div>
  );
}
