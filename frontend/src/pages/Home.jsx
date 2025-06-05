// src/pages/Home.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import CourseSearch from "../components/CourseSearch.js";
import "../App.css";

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedCoursesData, setSelectedCoursesData] = useState([]);
  const [isGeneratingSchedule, setIsGeneratingSchedule] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check if user is already authenticated on mount
  useEffect(() => {
    // Skip auth check if user just logged out
    if (location.state?.justLoggedOut) {
      console.log('User just logged out, skipping auth check');
      setIsCheckingAuth(false);
      // Clear the state so refresh doesn't skip check
      window.history.replaceState({}, document.title);
      return;
    }

    const checkAuthStatus = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/user', {
          method: 'GET',
          credentials: 'include', // Include cookies for session-based auth
        });

        if (response.ok) {
          // User is already authenticated, redirect to dashboard
          console.log('User already authenticated, redirecting to dashboard');
          navigate('/dashboard', { replace: true });
          return;
        }
      } catch (error) {
        console.log('No existing authentication found');
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuthStatus();
  }, [navigate, location.state]);

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <div className="container">
        <Link to="/" style={{ textDecoration: "none" }}>
          <h1 className="title">BruinPlan</h1>
        </Link>
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          Loading...
        </div>
      </div>
    );
  }

  function onClickLogin() {
    navigate("/login");
  }

  const handleCoursesChange = (coursesData) => {
    setSelectedCoursesData(coursesData);
  };

  const handlePlanClick = async (e) => {
    e.preventDefault();
    
    if (selectedCoursesData.length === 0) {
      return;
    }

    try {
      setIsGeneratingSchedule(true);
      
      // Send courses to schedule generation API (test endpoint since user might not be logged in)
      const response = await fetch('http://localhost:3000/api/schedule/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courses: selectedCoursesData
        })
      });

      const result = await response.json();
      
      console.log('Schedule generation result:', result);

      if (response.ok) {
        // Navigate to schedule view with the generated schedules
        navigate('/homesched', { 
          state: { 
            schedules: result,
            selectedCourses: selectedCoursesData,
            from: 'home'
          }
        });
      } else {
        alert(`Failed to generate schedule: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error generating schedule:', error);
      alert('Failed to generate schedule. Please try again.');
    } finally {
      setIsGeneratingSchedule(false);
    }
  };

  return (
    <div className="container">
      {/* "BruinPlan" title now links to "/" */}
      <Link to="/" style={{ textDecoration: "none" }}>
        <h1 className="title">BruinPlan</h1>
      </Link>

      {/* LOG IN button */}
      <button className="login-button" onClick={onClickLogin}>
        LOG IN
      </button>

      <CourseSearch onCoursesChange={handleCoursesChange} />

      <button 
        className={`plan-button ${selectedCoursesData.length === 0 || isGeneratingSchedule ? 'disabled' : ''}`}
        onClick={handlePlanClick}
        disabled={selectedCoursesData.length === 0 || isGeneratingSchedule}
      >
        {isGeneratingSchedule ? 'GENERATING...' : 'PLAN'}
      </button>
    </div>
  );
}
