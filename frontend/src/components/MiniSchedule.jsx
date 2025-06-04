import React from 'react';
import './MiniSchedule.css';

const dayColumnMap = {
  Monday: 2,
  Tuesday: 3,
  Wednesday: 4,
  Thursday: 5,
  Friday: 6
};

export default function MiniSchedule({ schedule }) {
  return (
    <div className="mini-timetable-grid">
      {/* Header row: Monday–Friday */}
      <div className="mini-grid-header empty-cell" />
      <div className="mini-grid-header">M</div>
      <div className="mini-grid-header">T</div>
      <div className="mini-grid-header">W</div>
      <div className="mini-grid-header">Th</div>
      <div className="mini-grid-header">F</div>

      {/* Time slots */}
      {Array.from({ length: 13 }).flatMap((_, rowIdx) => {
        const hour = 8 + rowIdx;
        let label;
        if (hour < 12) {
          label = `${hour}`;
        } else if (hour === 12) {
          label = `12`;
        } else {
          label = `${hour - 12}`;
        }
        return [
          <div
            key={`time-${rowIdx}`}
            className="mini-time-label"
            style={{ gridColumn: 1, gridRow: rowIdx + 2 }}
          >
            {label}
          </div>,
          ...Array.from({ length: 5 }, (_, colIdx) => (
            <div
              key={`empty-${rowIdx}-${colIdx}`}
              className="mini-grid-cell"
              style={{ gridColumn: colIdx + 2, gridRow: rowIdx + 2 }}
            />
          ))
        ];
      })}

      {/* Schedule blocks */}
      {schedule.map((entry, idx) => {
        const days = entry.day.split(',').map(d => d.trim());
        const startHour = Math.floor(entry.start);
        const endHour = Math.ceil(entry.end);
        const gridRowStart = startHour - 6;
        let gridRowEnd = endHour - 6;
        if (gridRowEnd > 11) gridRowEnd = 11;

        return days.map(dayName => {
          const col = dayColumnMap[dayName];
          if (!col) return null;
          return (
            <div
              key={`${idx}-${dayName}`}
              className={`mini-event-block ${entry.type}`}
              style={{
                gridColumn: col,
                gridRowStart: gridRowStart,
                gridRowEnd: gridRowEnd
              }}
            >
              <div className="mini-event-course">{entry.course}</div>
              {entry.section && (
                <div className="mini-event-section">{entry.section}</div>
              )}
            </div>
          );
        });
      })}
    </div>
  );
} 