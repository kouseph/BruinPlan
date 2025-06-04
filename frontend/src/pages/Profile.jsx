// src/pages/Profile.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Profile.css';

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
    // (Optional) clear auth/session here
    navigate('/');
  };

  return (
    <div className="profile-container">
      {/* “BruinPlan” title now links to "/dashboard" */}
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
          <div className="profile-card" />
          <div className="profile-card" />
          <div className="profile-card" />
          <div className="profile-card" />
        </div>
      </div>
    </div>
  );
}
