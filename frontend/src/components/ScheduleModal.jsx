import React from 'react';
import MiniSchedule from './MiniSchedule';
import './ScheduleModal.css';

export default function ScheduleModal({ schedule, onClose, googleId, scheduleIndex }) {
  const handleModalClick = (e) => {
    e.stopPropagation(); // Prevent modal from closing on internal click
  };

  const handleExportClick = async () => {
    try {
      const res = await fetch(`/api/ics?googleId=${googleId}&scheduleIndex=${scheduleIndex}`);
      if (!res.ok) throw new Error('Failed to generate calendar');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'schedule.ics';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to export calendar. Please try again.');
    }
  };

  const handleDeleteClick = async (index) => {
    try {
      const response = await fetch(`http://localhost:3000/api/schedules/${index}`, {
        method: 'DELETE',
        credentials: 'include', // ensures session cookie is sent
      });
  
      const data = await response.json();
  
      if (response.ok) {
        console.log('✅ Schedule deleted:', data.schedules);
        // Optionally update state to reflect deletion:
        // setSchedules(data.schedules);
      } else {
        console.error('❌ Delete failed:', data.message);
      }
    } catch (error) {
      console.error('🚨 Network error:', error);
    }
    window.location.reload();
  };
  

  return (
    <div className="schedule-modal-overlay" onClick={onClose}>
      <div className="schedule-modal-content" onClick={handleModalClick}>
        <div className="full-schedule">
          <MiniSchedule schedule={schedule} />
        </div>
        <div className="modal-buttons">
          <button className="export-button" onClick={handleExportClick}>
            Export Calendar (.ics)
          </button>
          <button className="delete-button" onClick={() => handleDeleteClick(scheduleIndex)}>
            Delete Schedule
          </button>
        </div>
      </div>
    </div>
  );
}
