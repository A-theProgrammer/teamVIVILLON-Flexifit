import React from 'react';
import { WorkoutDay } from '../../types/user';
import ExerciseItem from './ExerciseItem';
import './WorkoutDayCard.css';

interface WorkoutDayCardProps {
  day: WorkoutDay;
  isExpanded: boolean;
  isToday?: boolean;
  dayOfWeek?: string;
  dateString?: string;
  onToggle: () => void;
}

const WorkoutDayCard: React.FC<WorkoutDayCardProps> = ({ 
  day, 
  isExpanded, 
  isToday = false,
  dayOfWeek,
  dateString,
  onToggle 
}) => {
  // Determine if this is a rest day
  const isRestDay = day.focus.toLowerCase().includes('rest') || 
                   day.focus.toLowerCase().includes('recovery');
  
  return (
    <div className={`workout-day-card ${isExpanded ? 'expanded' : ''} ${isRestDay ? 'rest-day' : ''} ${isToday ? 'today' : ''}`}>
      <div className="day-header" onClick={onToggle}>
        <div className="day-info">
          <span className="day-number">Day {day.dayNumber}</span>
          {dayOfWeek && (
            <span className="day-of-week">{dayOfWeek}</span>
          )}
          {dateString && (
            <span className="day-date">{dateString}</span>
          )}
          {isToday && (
            <span className="today-badge">Today</span>
          )}
        </div>
        
        <div className="day-focus">
          <span className="focus-label">{day.focus}</span>
          <span className="exercise-count">
            {day.exercises.length} exercise{day.exercises.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        <button className="expand-button">
          {isExpanded ? '−' : '+'}
        </button>
      </div>
      
      {isExpanded && (
        <div className="day-content">
          {day.exercises.map((exercise, index) => (
            <ExerciseItem 
              key={index} 
              exercise={exercise} 
              index={index} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkoutDayCard;