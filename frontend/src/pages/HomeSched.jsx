// src/pages/HomeSched.jsx
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './HomeSched.css';

export default function HomeSched() {
  const navigate = useNavigate();

  const handleSaveClick = () => {
    navigate('/login', { state: { showLoginRequired: true } });
  };

  return (
    <div className="homesched-container">
      {/* “BruinPlan” title links to "/" */}
      <Link to="/" style={{ textDecoration: 'none' }}>
        <h1 className="homesched-title">BruinPlan</h1>
      </Link>

      <div className="homesched-main">
        <div className="homesched-rect" />
        <button
          className="homesched-arrow-btn"
          onClick={() => alert('Next schedule clicked')}
        >
          &rarr;
        </button>
      </div>

      {/* “SAVE” button */}
      <button className="homesched-save-button" onClick={handleSaveClick}>
        SAVE
      </button>
    </div>
  );
}
