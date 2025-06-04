import React from 'react';
import MiniSchedule from './MiniSchedule';
import './ScheduleModal.css';

export default function ScheduleModal({ schedule, onClose }) {
  const handleModalClick = (e) => {
    // Prevent clicks inside the schedule from closing the modal
    e.stopPropagation();
  };

  return (
    <div className="schedule-modal-overlay" onClick={onClose}>
      <div className="schedule-modal-content" onClick={handleModalClick}>
        <div className="full-schedule">
          <MiniSchedule schedule={schedule} />
        </div>
      </div>
    </div>
  );
} 