// src/pages/Dashboard.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css';

export default function Dashboard() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
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
    navigate('/profile');
  };

  const handleSignOut = () => {
    setDropdownOpen(false);
    // (Optional) clear auth tokens or session here
    navigate('/');
  };

  return (
    <div className="dashboard-container">
      {/* Profile icon + dropdown wrapper */}
      <div className="profile-wrapper" ref={dropdownRef}>
        <img
          className="dashboard-profile-icon"
          src="https://cdn-icons-png.flaticon.com/512/1946/1946429.png"
          alt="Profile"
          onClick={handleProfileClick}
        />
        {dropdownOpen && (
          <div className="profile-dropdown">
            <button
              className="dropdown-item"
              onClick={goToSavedSchedules}
            >
              Saved Schedules
            </button>
            <button className="dropdown-item" onClick={handleSignOut}>
              Sign Out
            </button>
          </div>
        )}
      </div>

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
