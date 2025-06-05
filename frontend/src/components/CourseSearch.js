import React, { useState, useEffect } from 'react';

const CourseSearch = ({ onCoursesChange }) => {
  const [subjectArea, setSubjectArea] = useState('');
  const [courseName, setCourseName] = useState('');
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);

  // Notify parent component whenever selected courses change
  useEffect(() => {
    // Send the complete course objects (not simplified data) to match backend expectations
    onCoursesChange?.(selectedCourses);
  }, [selectedCourses, onCoursesChange]);

  // Fetch courses from backend
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/courses');
        const data = await response.json();
        setCourses(data);
        // Don't set filteredCourses initially
        setFilteredCourses([]);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    fetchCourses();
  }, []);

  // Filter courses based on search inputs
  useEffect(() => {
    // If both search fields are empty, show no courses
    if (!subjectArea && !courseName) {
      setFilteredCourses([]);
      return;
    }

    const filtered = courses.filter(course => {
      // Extract subject area from sectionLink
      const subjectAreaMatch = course.sectionLink.match(/subj_area_cd=([^&]+)/);
      const courseSubjectArea = subjectAreaMatch ? decodeURIComponent(subjectAreaMatch[1]) : '';
      
      // Check if both subject area and course name match the search criteria
      const matchesSubjectArea = subjectArea === '' || 
        courseSubjectArea.toLowerCase().includes(subjectArea.toLowerCase());
      
      const matchesCourseName = courseName === '' || 
        course.course.toLowerCase().includes(courseName.toLowerCase());

      return matchesSubjectArea && matchesCourseName;
    });

    setFilteredCourses(filtered);
  }, [subjectArea, courseName, courses]);

  const handleSelectCourse = (course) => {
    // Extract subject area from sectionLink
    const subjectAreaMatch = course.sectionLink.match(/subj_area_cd=([^&]+)/);
    const courseSubjectArea = subjectAreaMatch ? decodeURIComponent(subjectAreaMatch[1]) : '';
    
    // Create full course title
    const fullCourseTitle = `${courseSubjectArea} ${course.course}`;
    
    // Check if course is already selected and we haven't reached the limit
    if (!selectedCourses.some(selected => selected._id === course._id) && selectedCourses.length < 4) {
      setSelectedCourses([...selectedCourses, { ...course, fullTitle: fullCourseTitle }]);
      
      // Clear search inputs
      setSubjectArea('');
      setCourseName('');
    }
  };

  const handleRemoveCourse = (courseId) => {
    setSelectedCourses(selectedCourses.filter(course => course._id !== courseId));
  };

  return (
    <div className="course-search">
      <div className="search-container">
        <input
          type="text"
          placeholder="Search by subject area (e.g., COM SCI)"
          value={subjectArea}
          onChange={(e) => setSubjectArea(e.target.value)}
          className="search-input"
        />
        <input
          type="text"
          placeholder="Search by course number/name (e.g., 35L)"
          value={courseName}
          onChange={(e) => setCourseName(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="selected-classes">
        <h2>Selected Classes ({selectedCourses.length}/4)</h2>
        <table className="selected-table">
          <tbody>
            {selectedCourses.map(course => (
              <tr key={course._id}>
                <td>
                  <div className="selected-course-content">
                    <div className="course-title">{course.fullTitle}</div>
                    <button 
                      onClick={() => handleRemoveCourse(course._id)}
                      className="remove-button"
                    >
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {[...Array(Math.max(0, 4 - selectedCourses.length))].map((_, idx) => (
              <tr key={`empty-${idx}`}>
                <td></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="search-results">
        {filteredCourses.map(course => {
          // Extract subject area from sectionLink
          const subjectAreaMatch = course.sectionLink.match(/subj_area_cd=([^&]+)/);
          const courseSubjectArea = subjectAreaMatch ? decodeURIComponent(subjectAreaMatch[1]) : '';
          
          // Split the course title into number and name
          const [courseNumber, ...courseNameParts] = course.course.split(' - ');
          const courseName = courseNameParts.join(' - ');

          return (
            <div key={course._id} className="course-item">
              <div className="course-content">
                <div className="course-header">
                  <h3>{courseSubjectArea} {courseNumber}</h3>
                  <h4 className="course-subtitle">{courseName}</h4>
                </div>
                <p>Instructor: {course.instructor}</p>
                <p>Time: {course.day} {course.time}</p>
                <div className="discussions">
                  <h4>Discussions:</h4>
                  {course.discussions.map(discussion => (
                    <div key={discussion._id} className="discussion-item">
                      <p>{discussion.section}: {discussion.day} {discussion.time}</p>
                      <p>Instructor: {discussion.instructor}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="course-footer">
                <button 
                  onClick={() => handleSelectCourse(course)}
                  className="select-button"
                  disabled={selectedCourses.some(selected => selected._id === course._id) || selectedCourses.length >= 4}
                >
                  {selectedCourses.some(selected => selected._id === course._id) ? 'Selected' : 'Select'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .course-search {
          padding: 20px;
          max-width: 800px;
          margin: 0 auto;
        }
        
        .search-container {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 20px;
        }
        
        .search-input {
          padding: 10px;
          font-size: 16px;
          border: 1px solid #ccc;
          border-radius: 4px;
          width: 100%;
        }
        
        .course-item {
          border: 1px solid #eee;
          padding: 15px;
          margin-bottom: 15px;
          border-radius: 4px;
          background-color: #fff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          display: flex;
          flex-direction: column;
        }

        .course-content {
          flex: 1;
        }

        .course-content p {
          color: #000;
          margin: 5px 0;
          font-size: 14px;
        }

        .course-footer {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid #eee;
          display: flex;
          justify-content: center;
        }

        .select-button {
          padding: 8px 16px;
          background-color: #2196f3;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          width: 80%;
          transition: background-color 0.2s ease;
        }

        .select-button:hover:not(:disabled) {
          background-color: #1976d2;
        }

        .select-button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }

        .selected-course-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 8px 0;
        }

        .course-title {
          text-align: center;
          color: #2c3e50;
          font-weight: 500;
        }

        .remove-button {
          padding: 6px 12px;
          background-color: #ff5252;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          transition: background-color 0.2s ease;
        }

        .remove-button:hover {
          background-color: #ff1744;
        }

        .selected-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }

        .selected-table td {
          padding: 10px;
          border: 1px solid #eee;
          background-color: white;
          vertical-align: middle;
        }

        .selected-table tr:empty td {
          height: 40px;
        }
        
        .discussions {
          margin-top: 10px;
          padding-left: 15px;
          border-left: 2px solid #eee;
        }
        
        .discussions h4 {
          color: #000;
          margin-bottom: 8px;
          font-size: 14px;
        }
        
        .discussion-item {
          margin-bottom: 10px;
          padding: 5px 0;
        }

        .discussion-item p {
          color: #000;
          margin: 2px 0;
          font-size: 13px;
        }
        
        .course-header {
          margin-bottom: 15px;
        }

        h3 {
          margin: 0;
          color: #2c3e50;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .course-subtitle {
          margin: 5px 0 0 0;
          color: #34495e;
          font-size: 1rem;
          font-weight: 400;
        }
      `}</style>
    </div>
  );
};

export default CourseSearch; 