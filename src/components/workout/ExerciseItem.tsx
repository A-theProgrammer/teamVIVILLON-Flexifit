import React from 'react';
import { WorkoutExercise } from '../../types/user';
import './ExerciseItem.css';

interface ExerciseItemProps {
  exercise: WorkoutExercise;
  index: number;
  isHighlighted?: boolean;
}

const ExerciseItem: React.FC<ExerciseItemProps> = ({ 
  exercise, 
  index,
  isHighlighted = false
}) => {
  return (
    <div className={`exercise-item ${isHighlighted ? 'highlighted' : ''}`}>
      <div className="exercise-header">
        <span className="exercise-number">{index + 1}</span>
        <h3 className="exercise-name">{exercise.name}</h3>
        <span className="exercise-intensity">{exercise.intensity}</span>
      </div>
      
      <div className="exercise-details">
        {exercise.sets && (
          <div className="detail-tag">
            <span className="detail-label">Sets</span>
            <span className="detail-value">{exercise.sets}</span>
          </div>
        )}
        
        {exercise.reps && (
          <div className="detail-tag">
            <span className="detail-label">Reps</span>
            <span className="detail-value">{exercise.reps}</span>
          </div>
        )}
        
        {exercise.duration && (
          <div className="detail-tag">
            <span className="detail-label">Duration</span>
            <span className="detail-value">{exercise.duration}s</span>
          </div>
        )}
        
        {exercise.restTime && (
          <div className="detail-tag">
            <span className="detail-label">Rest</span>
            <span className="detail-value">{exercise.restTime}s</span>
          </div>
        )}
      </div>
      
      {exercise.notes && (
        <p className="exercise-notes">{exercise.notes}</p>
      )}
    </div>
  );
};

export default ExerciseItem;