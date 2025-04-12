import React, { useState, useEffect } from 'react';
import { WorkoutPlan, WorkoutDay } from '../../types/user';
import WorkoutDayCard from './WorkoutDayCard';
import './WorkoutDayList.css';

interface WorkoutDayListProps {
  workoutPlan: WorkoutPlan;
  onSelectDay?: (dayNumber: number) => void;
}

const WorkoutDayList: React.FC<WorkoutDayListProps> = ({ workoutPlan, onSelectDay }) => {
  const [expandedDayNumber, setExpandedDayNumber] = useState<number | null>(null);
  const [today] = useState(new Date());
  const [todayWorkoutDay, setTodayWorkoutDay] = useState<number | null>(null);
  
  // Find the workout day that corresponds to today
  useEffect(() => {
    // Get current day of week (0 = Sunday, 6 = Saturday)
    const dayOfWeek = today.getDay();
    // Convert to 1-7 where 1 is Monday, 7 is Sunday
    const mappedDayNumber = dayOfWeek === 0 ? 7 : dayOfWeek;
    
    // Find the workout day that matches the current day of week
    const matchingDay = workoutPlan.days.find(day => (((day.dayNumber - 1) % 7) + 1) === mappedDayNumber);
    
    if (matchingDay) {
      setTodayWorkoutDay(matchingDay.dayNumber);
      setExpandedDayNumber(matchingDay.dayNumber);
    } else {
      setTodayWorkoutDay(null);
    }
  }, [workoutPlan, today]);
  
  // Toggle day expansion
  const toggleDay = (dayNumber: number) => {
    if (expandedDayNumber === dayNumber) {
      setExpandedDayNumber(null);
    } else {
      setExpandedDayNumber(dayNumber);
      if (onSelectDay) {
        onSelectDay(dayNumber);
      }
    }
  };
  
  // Sort days by day number
  const sortedDays = [...workoutPlan.days].sort((a, b) => a.dayNumber - b.dayNumber);
  
  // Get day of the week label based on day number
  const getDayOfWeek = (dayNumber: number): string => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days[(dayNumber - 1) % 7];
  };
  
  // Get date for a workout day
  const getDateForWorkoutDay = (day: WorkoutDay): string => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 (Sunday) to 6 (Saturday)
    const currentMappedDay = dayOfWeek === 0 ? 7 : dayOfWeek; // Convert to 1-7 where 1 is Monday
    
    // Calculate the difference between the workout day and the current day
    // Workout day uses 1-7 mapping where 1 is Monday
    const workoutMappedDay = ((day.dayNumber - 1) % 7) + 1;
    
    // Calculate days to add
    let daysToAdd = workoutMappedDay - currentMappedDay;
    if (daysToAdd <= 0) {
      daysToAdd += 7; // Add a week if the day has already passed
    }
    
    // Create a new date by adding days
    const date = new Date(now);
    date.setDate(now.getDate() + daysToAdd);
    
    // Format date as "MM/DD"
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };
  
  return (
    <div className="workout-day-list">
      <h2 className="workout-day-list-title">Weekly Workout Schedule</h2>
      
      <div className="day-list-container">
        {sortedDays.map((day) => (
          <WorkoutDayCard
            key={day.dayNumber}
            day={day}
            isExpanded={expandedDayNumber === day.dayNumber}
            isToday={todayWorkoutDay === day.dayNumber}
            dayOfWeek={getDayOfWeek(day.dayNumber)}
            dateString={getDateForWorkoutDay(day)}
            onToggle={() => toggleDay(day.dayNumber)}
          />
        ))}
      </div>
    </div>
  );
};

export default WorkoutDayList;