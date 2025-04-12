import React, { useState, useEffect } from 'react';
import { WorkoutPlan, WorkoutDay, WorkoutExercise } from '../../types/user';
import { UserFeedback } from '../../adaptiveEngine/types';
import { useAppContext } from '../../context/AppContext';
import ExerciseItem from './ExerciseItem';
import './TodayWorkout.css';

interface TodayWorkoutProps {
  workoutPlan: WorkoutPlan;
  onStartWorkout?: () => void;
}

const TodayWorkout: React.FC<TodayWorkoutProps> = ({ workoutPlan, onStartWorkout }) => {
  const { currentDate, addFeedback, setFeedbackNeeded, updateCompletedExercises } = useAppContext();
  const [todayWorkout, setTodayWorkout] = useState<WorkoutDay | null>(null);
  const [completionPercent, setCompletionPercent] = useState(0);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set());
  const [quickFeedbackRating, setQuickFeedbackRating] = useState<1 | 2 | 3 | null>(null);
  
  // Current date formatting
  const dateOptions: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  const formattedDate = currentDate.toLocaleDateString(undefined, dateOptions);
  
  // Calculate week number of the year
  const getWeekNumber = (date: Date): number => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };
  
  const weekNumber = getWeekNumber(currentDate);
  
  // Get day of the week (0 = Sunday, 6 = Saturday)
  const dayOfWeek = currentDate.getDay();
  
  // Find the workout for today
  useEffect(() => {
    // Match day of week to workout plan
    // For demonstration purposes, we'll map day 1 to Monday, day 2 to Tuesday, etc.
    // If the plan doesn't have enough days, we'll use modulo
    const todayDayNumber = dayOfWeek === 0 ? 7 : dayOfWeek; // Convert to 1-7 where 1 is Monday
    
    // Find workout day that matches the current day of week
    // or show a placeholder if there's no workout for today
    const matchingDay = workoutPlan.days.find(day => (((day.dayNumber - 1) % 7) + 1) === todayDayNumber);
    
    setTodayWorkout(matchingDay || null);
  }, [workoutPlan, dayOfWeek, currentDate]);
  
  // Handle exercise completion
  const toggleExerciseCompletion = (index: number) => {
    if (!isWorkoutActive) return;
    
    setCompletedExercises(prev => {
      const updated = new Set(prev);
      if (updated.has(index)) {
        updated.delete(index);
      } else {
        updated.add(index);
      }
      
      // Update completion percentage
      if (todayWorkout) {
        const completionRate = updated.size / todayWorkout.exercises.length;
        setCompletionPercent(Math.round(completionRate * 100));
      }
      
      return updated;
    });
  };
  
  // Start workout
  const handleStartWorkout = () => {
    setIsWorkoutActive(true);
    setElapsedTime(0);
    setCompletedExercises(new Set());
    setCompletionPercent(0);
    setQuickFeedbackRating(null);
    
    if (onStartWorkout) {
      onStartWorkout();
    }
  };
  
  // End workout
const handleEndWorkout = () => {
  setIsWorkoutActive(false);
  setFeedbackNeeded(true);
  
  // 保存已完成的练习
  if (todayWorkout && completedExercises.size > 0) {
    const exerciseIds = Array.from(completedExercises).map(index => {
      return `${todayWorkout.dayNumber}-${index}`;
    });
    
    updateCompletedExercises(exerciseIds);
  }
};
  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isWorkoutActive) {
      timer = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isWorkoutActive]);
  
  // Format elapsed time
  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Handle quick feedback
  const handleQuickFeedback = (rating: 1 | 2 | 3) => {
    setQuickFeedbackRating(rating);
    
    // If we have a workout for today, submit feedback for each completed exercise
    if (todayWorkout && completedExercises.size > 0) {
      const difficultyMap = {
        1: 2, // Too Easy
        2: 3, // Just Right
        3: 4  // Too Hard
      };
      
      const enjoymentMap = {
        1: 2, // Too Easy - Moderate enjoyment
        2: 4, // Just Right - High enjoyment
        3: 2  // Too Hard - Moderate enjoyment
      };
      
      // Get the day number
      const dayNumber = todayWorkout.dayNumber;
      
      // Create feedback for each completed exercise
      Array.from(completedExercises).forEach(exerciseIndex => {
        const feedback: UserFeedback = {
          exerciseId: `${dayNumber}-${exerciseIndex}`,
          difficulty: difficultyMap[rating],
          fatigue: rating === 3 ? 4 : rating === 2 ? 3 : 2,
          enjoyment: enjoymentMap[rating],
          completionTime: Date.now(),
          notes: rating === 1 ? "Found this too easy" : 
                rating === 2 ? "This was just right for me" : 
                "This was too challenging"
        };
        
        addFeedback(feedback);
      });
    }
  };
  
  // Handle detailed feedback button click
  const handleDetailedFeedback = () => {
    // Navigate to the feedback tab
    // For now, just log the action
    console.log("Navigate to detailed feedback");
    
    // You could implement a callback to switch to the feedback tab
    // or use a routing solution to navigate
  };
  
  // If there's no workout today
  if (!todayWorkout) {
    return (
      <div className="today-workout rest-day">
        <div className="today-header">
          <div className="today-date-info">
            <h2>{formattedDate}</h2>
            <span className="week-number">Week {weekNumber}</span>
          </div>
        </div>
        
        <div className="rest-day-content">
          <h3>Rest Day</h3>
          <p>
            No workout is scheduled for today. Take this time to recover and prepare for your next session.
          </p>
          <div className="rest-day-suggestions">
            <h4>Recovery Suggestions:</h4>
            <ul>
              <li>Get plenty of sleep</li>
              <li>Stay hydrated</li>
              <li>Consider light stretching or walking</li>
              <li>Focus on nutrition</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="today-workout">
      <div className="today-header">
        <div className="today-date-info">
          <h2>{formattedDate}</h2>
          <span className="week-number">Week {weekNumber}</span>
        </div>
        
        <div className="today-focus">
          <span className="focus-label">{todayWorkout.focus}</span>
        </div>
      </div>
      
      {/* Progress indicator */}
      <div className="workout-progress">
        <div className="progress-stat">
          <span className="stat-label">Completion</span>
          <div className="progress-bar-container">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${completionPercent}%` }}
            ></div>
          </div>
          <span className="progress-percentage">{completionPercent}%</span>
        </div>
        
        {isWorkoutActive && (
          <div className="workout-timer">
            <span className="timer-label">Elapsed Time</span>
            <span className="timer-value">{formatTime(elapsedTime)}</span>
          </div>
        )}
      </div>
      
      {/* Workout controls */}
      <div className="workout-controls">
        {!isWorkoutActive ? (
          <button className="start-workout-button" onClick={handleStartWorkout}>
            Start Today's Workout
          </button>
        ) : (
          <button className="end-workout-button" onClick={handleEndWorkout}>
            End Workout
          </button>
        )}
      </div>
      
      {/* Exercise list */}
      <div className="today-exercises">
        <h3>Today's Exercises</h3>
        
        <div className="exercise-list">
          {todayWorkout.exercises.map((exercise, index) => (
            <div 
              key={index}
              className={`exercise-wrapper ${completedExercises.has(index) ? 'completed' : ''}`}
              onClick={() => toggleExerciseCompletion(index)}
            >
              <div className="exercise-checkbox">
                {completedExercises.has(index) ? '✓' : ''}
              </div>
              <div className="exercise-content">
                <ExerciseItem 
                  exercise={exercise} 
                  index={index} 
                  isHighlighted={false}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Quick feedback section - shown after workout completion */}
      {!isWorkoutActive && completionPercent > 0 && (
        <div className="quick-feedback">
          <h3>Quick Feedback</h3>
          <p>How was your workout today?</p>
          
          <div className="rating-buttons">
            <button 
              className={`rating-button difficulty-1 ${quickFeedbackRating === 1 ? 'selected' : ''}`}
              onClick={() => handleQuickFeedback(1)}
            >
              Too Easy
            </button>
            <button 
              className={`rating-button difficulty-2 ${quickFeedbackRating === 2 ? 'selected' : ''}`}
              onClick={() => handleQuickFeedback(2)}
            >
              Just Right
            </button>
            <button 
              className={`rating-button difficulty-3 ${quickFeedbackRating === 3 ? 'selected' : ''}`}
              onClick={() => handleQuickFeedback(3)}
            >
              Too Hard
            </button>
          </div>
          
          <button className="detailed-feedback-button" onClick={handleDetailedFeedback}>
            Provide Detailed Feedback
          </button>
        </div>
      )}
    </div>
  );
};

export default TodayWorkout;