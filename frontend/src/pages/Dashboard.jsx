// src/pages/Dashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

export default function Dashboard() {
  return (
    <div className="dashboard-container">
      {/* Profile icon (links to /profile) */}
      <Link to="/profile">
        <img
          className="dashboard-profile-icon"
          src="https://cdn-icons-png.flaticon.com/512/1946/1946429.png"
          alt="Profile"
        />
      </Link>

      {/* Title */}
      <h1 className="dashboard-title">BruinPlan</h1>

      {/* Input fields */}
      <div className="dashboard-input-group">
        <input
          type="text"
          placeholder="Enter Subject Area"
          className="dashboard-input"
        />
        <input
          type="text"
          placeholder="Enter Class Title"
          className="dashboard-input"
        />
      </div>

      {/* Selected Classes table */}
      <div className="dashboard-selected-classes">
        <h2>Selected Classes</h2>
        <table className="dashboard-table">
          <tbody>
            {[...Array(4)].map((_, idx) => (
              <tr key={idx}>
                <td></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* “PLAN” button now wrapped in Link → "/schedules" */}
      <Link to="/schedules" style={{ textDecoration: 'none' }}>
        <button className="dashboard-plan-button">PLAN</button>
      </Link>
    </div>
  );
}
