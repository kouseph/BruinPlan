// src/pages/Selected.jsx
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Selected.css';

export default function Selected() {
  const navigate = useNavigate();

  return (
    <div className="selected-container">
      {/* “BruinPlan” title now links to "/dashboard" */}
      <Link to="/dashboard" style={{ textDecoration: 'none' }}>
        <h1 className="selected-title">BruinPlan</h1>
      </Link>

      {/* Profile icon (top-right) */}
      <Link to="/profile">
        <img
          className="selected-profile-icon"
          src="https://cdn-icons-png.flaticon.com/512/1946/1946429.png"
          alt="Profile"
        />
      </Link>

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
