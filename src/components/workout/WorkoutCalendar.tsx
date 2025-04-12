import React, { useState, useEffect } from 'react';
import { WorkoutPlan } from '../../types/user';
import './WorkoutCalendar.css';

interface WorkoutCalendarProps {
  workoutPlan: WorkoutPlan;
  onSelectDay?: (date: Date) => void;
}

const WorkoutCalendar: React.FC<WorkoutCalendarProps> = ({ workoutPlan, onSelectDay }) => {
  const [currentDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth());
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());
  const [calendarDays, setCalendarDays] = useState<Array<{ date: Date, hasWorkout: boolean, isCurrentDay: boolean }>>(
    []
  );
  
  // Generate calendar days for the current month
  useEffect(() => {
    const days = [];
    
    // Get the first day of the month
    const firstDay = new Date(currentYear, currentMonth, 1);
    // Get the last day of the month
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    
    // Get the day of the week for the first day (0 = Sunday, 6 = Saturday)
    let startingDayOfWeek = firstDay.getDay();
    
    // Calculate days from previous month to fill the first week
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - 1, prevMonthLastDay - i);
      days.push({
        date,
        hasWorkout: hasWorkoutOnDate(date),
        isCurrentDay: isSameDay(date, currentDate)
      });
    }
    
    // Add days of the current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(currentYear, currentMonth, i);
      days.push({
        date,
        hasWorkout: hasWorkoutOnDate(date),
        isCurrentDay: isSameDay(date, currentDate)
      });
    }
    
    // Calculate the remaining days needed to complete the last week
    const remainingDays = 7 - (days.length % 7);
    if (remainingDays < 7) {
      for (let i = 1; i <= remainingDays; i++) {
        const date = new Date(currentYear, currentMonth + 1, i);
        days.push({
          date,
          hasWorkout: hasWorkoutOnDate(date),
          isCurrentDay: isSameDay(date, currentDate)
        });
      }
    }
    
    setCalendarDays(days);
  }, [currentMonth, currentYear, workoutPlan, currentDate]);
  
  // Check if a date has a workout
  const hasWorkoutOnDate = (date: Date): boolean => {
    // Map days of the week to workout plan days
    // For demonstration purposes, we'll map day 1 to Monday, day 2 to Tuesday, etc.
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const mappedDayNumber = dayOfWeek === 0 ? 7 : dayOfWeek; // Convert to 1-7 where 1 is Monday
    
    // Find if there's a workout day that matches this day of week
    return workoutPlan.days.some(day => (((day.dayNumber - 1) % 7) + 1) === mappedDayNumber);
  };
  
  // Check if two dates are the same day
  const isSameDay = (date1: Date, date2: Date): boolean => {
    return date1.getDate() === date2.getDate() && 
           date1.getMonth() === date2.getMonth() && 
           date1.getFullYear() === date2.getFullYear();
  };
  
  // Go to previous month
  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };
  
  // Go to next month
  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };
  
  // Handle day click
  const handleDayClick = (date: Date) => {
    if (onSelectDay) {
      onSelectDay(date);
    }
  };
  
  // Format month and year
  const formattedMonthYear = new Intl.DateTimeFormat('en-US', { 
    month: 'long', 
    year: 'numeric' 
  }).format(new Date(currentYear, currentMonth, 1));
  
  // Names of weekdays
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <div className="workout-calendar">
      <div className="calendar-header">
        <button className="month-nav-button" onClick={goToPrevMonth}>
          &lt;
        </button>
        <h3 className="current-month">{formattedMonthYear}</h3>
        <button className="month-nav-button" onClick={goToNextMonth}>
          &gt;
        </button>
      </div>
      
      <div className="calendar-grid">
        {/* Weekday headers */}
        <div className="weekday-headers">
          {weekdays.map(day => (
            <div key={day} className="weekday-header">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar days */}
        <div className="calendar-days">
          {calendarDays.map((dayInfo, index) => {
            const isCurrentMonth = dayInfo.date.getMonth() === currentMonth;
            
            return (
              <div 
                key={index}
                className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${dayInfo.isCurrentDay ? 'current-day' : ''} ${dayInfo.hasWorkout ? 'has-workout' : ''}`}
                onClick={() => handleDayClick(dayInfo.date)}
              >
                <span className="day-number">{dayInfo.date.getDate()}</span>
                {dayInfo.hasWorkout && <div className="workout-indicator"></div>}
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="calendar-legend">
        <div className="legend-item">
          <div className="legend-color has-workout"></div>
          <span>Workout Day</span>
        </div>
        <div className="legend-item">
          <div className="legend-color current-day-legend"></div>
          <span>Current Day</span>
        </div>
      </div>
    </div>
  );
};

export default WorkoutCalendar;