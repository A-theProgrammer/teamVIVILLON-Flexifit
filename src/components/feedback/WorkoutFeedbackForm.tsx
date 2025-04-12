import React, { useState } from 'react';
import { WorkoutPlan } from '../../types/user';
import { UserFeedback } from '../../adaptiveEngine/types';
import './WorkoutFeedbackForm.css';

interface WorkoutFeedbackFormProps {
  workoutPlan: WorkoutPlan;
  onSubmitFeedback: (feedback: UserFeedback) => void;
}

const WorkoutFeedbackForm: React.FC<WorkoutFeedbackFormProps> = ({ 
  workoutPlan, 
  onSubmitFeedback 
}) => {
  // State for the form fields
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [selectedExercise, setSelectedExercise] = useState<string>('');
  const [difficulty, setDifficulty] = useState<number>(3);
  const [fatigue, setFatigue] = useState<number>(3);
  const [enjoyment, setEnjoyment] = useState<number>(3);
  const [feedbackNotes, setFeedbackNotes] = useState<string>('');
  
  // Get the list of exercises for the selected day
  const getExercisesForDay = () => {
    if (!selectedDay) return [];
    
    const dayNumber = parseInt(selectedDay);
    const day = workoutPlan.days.find(d => d.dayNumber === dayNumber);
    return day ? day.exercises : [];
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDay || !selectedExercise) {
      alert('Please select a day and exercise');
      return;
    }
    
    // Create the feedback object
    const feedback: UserFeedback = {
      exerciseId: `${selectedDay}-${selectedExercise}`, // Format: dayNumber-exerciseIndex
      difficulty,
      fatigue,
      enjoyment,
      completionTime: Date.now(),
      notes: feedbackNotes
    };
    
    // Pass the feedback to the parent component
    onSubmitFeedback(feedback);
    
    // Reset the form
    setSelectedExercise('');
    setDifficulty(3);
    setFatigue(3);
    setEnjoyment(3);
    setFeedbackNotes('');
  };
  
  // Render the rating options
  const renderRatingOptions = (
    value: number, 
    onChange: (value: number) => void,
    label: string
  ) => {
    return (
      <div className="rating-container">
        <span className="rating-label">{label}:</span>
        <div className="rating-options">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              type="button"
              className={`rating-option ${value === rating ? 'selected' : ''}`}
              onClick={() => onChange(rating)}
            >
              {rating}
            </button>
          ))}
        </div>
        <span className="rating-description">
          {getRatingDescription(label, value)}
        </span>
      </div>
    );
  };
  
  // Get description for rating values
  const getRatingDescription = (label: string, value: number): string => {
    if (label === 'Difficulty') {
      const descriptions = [
        'Very Easy',
        'Easy',
        'Moderate',
        'Hard',
        'Very Hard'
      ];
      return descriptions[value - 1];
    } else if (label === 'Fatigue') {
      const descriptions = [
        'Not Tired',
        'Slightly Tired',
        'Moderately Tired',
        'Very Tired',
        'Extremely Tired'
      ];
      return descriptions[value - 1];
    } else if (label === 'Enjoyment') {
      const descriptions = [
        'Did Not Enjoy',
        'Enjoyed a Little',
        'Moderately Enjoyed',
        'Enjoyed a Lot',
        'Loved It'
      ];
      return descriptions[value - 1];
    }
    return '';
  };
  
  return (
    <div className="workout-feedback-form">
      <h2>Workout Feedback</h2>
      <p className="form-description">
        Your feedback helps our adaptive engine tailor your workouts to your needs.
      </p>
      
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="day-select">Select Workout Day:</label>
            <select
              id="day-select"
              value={selectedDay}
              onChange={(e) => {
                setSelectedDay(e.target.value);
                setSelectedExercise('');
              }}
              required
            >
              <option value="">Choose a day</option>
              {workoutPlan.days.map((day) => (
                <option key={day.dayNumber} value={day.dayNumber}>
                  Day {day.dayNumber}: {day.focus}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="exercise-select">Select Exercise:</label>
            <select
              id="exercise-select"
              value={selectedExercise}
              onChange={(e) => setSelectedExercise(e.target.value)}
              disabled={!selectedDay}
              required
            >
              <option value="">Choose an exercise</option>
              {getExercisesForDay().map((exercise, index) => (
                <option key={index} value={index}>
                  {exercise.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="ratings-container">
          {renderRatingOptions(difficulty, setDifficulty, 'Difficulty')}
          {renderRatingOptions(fatigue, setFatigue, 'Fatigue')}
          {renderRatingOptions(enjoyment, setEnjoyment, 'Enjoyment')}
        </div>
        
        <div className="form-group">
          <label htmlFor="feedback-notes">Additional Notes:</label>
          <textarea
            id="feedback-notes"
            value={feedbackNotes}
            onChange={(e) => setFeedbackNotes(e.target.value)}
            placeholder="Any specific comments about this exercise? (optional)"
            rows={3}
          />
        </div>
        
        <button type="submit" className="submit-button">
          Submit Feedback
        </button>
      </form>
    </div>
  );
};

export default WorkoutFeedbackForm;