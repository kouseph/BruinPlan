import React from 'react';
import MiniSchedule from './MiniSchedule';
import './ScheduleModal.css';

export default function ScheduleModal({ schedule, onClose, googleId, scheduleIndex = 0 }) {
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

  const handleDeleteClick = () => {
    // Add your delete functionality here
    console.log('Delete button clicked');
    alert('Delete functionality to be implemented');
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
          <button className="delete-button" onClick={handleDeleteClick}>
            Delete Schedule
          </button>
        </div>
      </div>
    </div>
  );
}
