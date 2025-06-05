// src/pages/Home.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import CourseSearch from "../components/CourseSearch.js";
import "../App.css";

export default function Home() {
  const navigate = useNavigate();
  const [selectedCoursesData, setSelectedCoursesData] = useState([]);
  const [isGeneratingSchedule, setIsGeneratingSchedule] = useState(false);

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
      {/* “BruinPlan” title now links to "/" */}
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
