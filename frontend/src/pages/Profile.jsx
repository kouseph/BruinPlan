// src/pages/Profile.jsx
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Profile.css';

export default function Profile() {
  const navigate = useNavigate();

  return (
    <div className="profile-container">
      {/* “BruinPlan” title now links to "/dashboard" */}
      <Link to="/dashboard" style={{ textDecoration: 'none' }}>
        <h1 className="profile-title">BruinPlan</h1>
      </Link>

      <div className="profile-content">
        <div className="profile-sidebar">
          <button
            className="sidebar-button"
            onClick={() => {
              alert('Saved schedules clicked');
            }}
          >
            Saved schedules
          </button>
          <button
            className="sidebar-button"
            onClick={() => {
              navigate('/');
            }}
          >
            Sign out
          </button>
        </div>

        <div className="profile-divider" />

        <div className="profile-main">
          <div className="profile-card" />
          <div className="profile-card" />
          <div className="profile-card" />
          <div className="profile-card" />
        </div>
      </div>
    </div>
  );
}
