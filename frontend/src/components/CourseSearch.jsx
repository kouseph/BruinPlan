import React, { useState, useEffect } from 'react';
import './CourseSearch.css';

const CourseSearch = ({ onCourseSelect }) => {
  const [allCourses, setAllCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [subjectArea, setSubjectArea] = useState('');
  const [classTitle, setClassTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all courses on component mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/courses');
        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }
        const data = await response.json();
        setAllCourses(data);
        setFilteredCourses(data);
      } catch (err) {
        setError('Failed to load courses. Please try again.');
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Extract subject area from sectionLink
  const getSubjectArea = (sectionLink) => {
    try {
      const url = new URL(sectionLink);
      const params = new URLSearchParams(url.search);
      return decodeURIComponent(params.get('subj_area_cd') || '').replace('%20', ' ');
    } catch {
      return '';
    }
  };

  // Filter courses based on subject area and class title
  useEffect(() => {
    const filterCourses = () => {
      return allCourses.filter(course => {
        const courseSubjectArea = getSubjectArea(course.sectionLink);
        const matchSubject = !subjectArea || 
          courseSubjectArea.toLowerCase().includes(subjectArea.toLowerCase());
        
        const matchTitle = !classTitle || 
          course.course.toLowerCase().includes(classTitle.toLowerCase());

        return matchSubject && matchTitle;
      });
    };

    setFilteredCourses(filterCourses());
  }, [subjectArea, classTitle, allCourses]);

  const handleCourseSelect = (course) => {
    if (onCourseSelect) {
      onCourseSelect(course);
    }
  };

  return (
    <div className="course-search-container">
      <div className="search-inputs">
        <div className="search-input-group">
          <label htmlFor="subjectArea">Subject Area</label>
          <input
            id="subjectArea"
            type="text"
            value={subjectArea}
            onChange={(e) => setSubjectArea(e.target.value)}
            placeholder="e.g., COM SCI"
            className="search-input"
          />
        </div>
        <div className="search-input-group">
          <label htmlFor="classTitle">Class Title/Number</label>
          <input
            id="classTitle"
            type="text"
            value={classTitle}
            onChange={(e) => setClassTitle(e.target.value)}
            placeholder="e.g., 35L"
            className="search-input"
          />
        </div>
      </div>

      {loading && <div className="search-spinner">Loading courses...</div>}
      {error && <div className="search-error">{error}</div>}

      <div className="search-results">
        {filteredCourses.map((course, index) => (
          <div
            key={course._id || index}
            className="search-result-item"
            onClick={() => handleCourseSelect(course)}
          >
            <div className="course-header">
              <span className="subject-area">{getSubjectArea(course.sectionLink)}</span>
              <span className="course-title">{course.course}</span>
            </div>
            <div className="course-details">
              <div className="lecture-info">
                <strong>Lecture:</strong>
                <div>Instructor: {course.instructor}</div>
                <div>Time: {course.day} {course.time}</div>
              </div>
              {course.discussions && course.discussions.length > 0 && (
                <div className="discussions-info">
                  <strong>Discussions:</strong>
                  <div className="discussions-list">
                    {course.discussions.map((disc, idx) => (
                      <div key={disc._id || idx} className="discussion-item">
                        <div>{disc.section}: {disc.day} {disc.time}</div>
                        <div>Instructor: {disc.instructor}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {filteredCourses.length === 0 && !loading && (
          <div className="no-results">No courses found matching your search criteria</div>
        )}
      </div>
    </div>
  );
};

export default CourseSearch; 