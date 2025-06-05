// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import CourseSearch from "../components/CourseSearch.js";
import "../App.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const [selectedCoursesData, setSelectedCoursesData] = useState([]);
  const [isGeneratingSchedule, setIsGeneratingSchedule] = useState(false);
  const [isSavingCourses, setIsSavingCourses] = useState(false);

  // Load user's previously selected courses on component mount
  useEffect(() => {
    const loadUserCourses = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/user', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const userData = await response.json();
          if (userData.selectedCourses && Array.isArray(userData.selectedCourses)) {
            setSelectedCoursesData(userData.selectedCourses);
          }
        }
      } catch (error) {
        console.error('Error loading user courses:', error);
      }
    };

    loadUserCourses();
  }, []);

  // Save selected courses whenever they change
  useEffect(() => {
    const saveSelectedCourses = async () => {
      if (selectedCoursesData.length === 0) return;

      try {
        setIsSavingCourses(true);
        await fetch('http://localhost:3000/api/user/courses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            courses: selectedCoursesData
          })
        });
      } catch (error) {
        console.error('Error saving selected courses:', error);
      } finally {
        setIsSavingCourses(false);
      }
    };

    const timeoutId = setTimeout(saveSelectedCourses, 1000); // Debounce saves
    return () => clearTimeout(timeoutId);
  }, [selectedCoursesData]);

  const handleCoursesChange = (coursesData) => {
    setSelectedCoursesData(coursesData);
  };

  const handlePlanClick = async () => {
    if (selectedCoursesData.length === 0) {
      return;
    }

    try {
      setIsGeneratingSchedule(true);
      
      // Use authenticated endpoint for logged-in users
      const response = await fetch('http://localhost:3000/api/schedule/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          courses: selectedCoursesData
        })
      });

      const result = await response.json();
      
      console.log('Schedule generation result:', result);

      if (response.ok && result.success) {
        // Navigate to schedule view with the generated schedules
        navigate('/schedules', { 
          state: { 
            schedules: result.schedules,
            selectedCourses: selectedCoursesData,
            from: 'dashboard'
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

      <CourseSearch onCoursesChange={handleCoursesChange} />

      {isSavingCourses && (
        <div className="saving-indicator-dashboard">
          Saving selected courses...
      </div>
      )}

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
