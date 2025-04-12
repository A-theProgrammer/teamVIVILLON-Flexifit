import React from 'react';
import { WorkoutPlan } from '../../types/user';
import './WorkoutPlanOverview.css';

interface WorkoutPlanOverviewProps {
  workoutPlan: WorkoutPlan;
  onGenerateNewPlan?: () => void;
  adaptationInProgress?: boolean;
  lastAdaptationTime?: Date | null;
}

const WorkoutPlanOverview: React.FC<WorkoutPlanOverviewProps> = ({ 
  workoutPlan, 
  onGenerateNewPlan,
  adaptationInProgress,
  lastAdaptationTime
}) => {
  // Calculate some overview metrics
  const totalWorkoutDays = workoutPlan.days.filter(
    day => !day.focus.toLowerCase().includes('rest')
  ).length;
  
  const totalExercises = workoutPlan.days.reduce(
    (total, day) => total + day.exercises.length, 0
  );
  
  // Format the creation date
  const creationDate = new Date(workoutPlan.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Get primary focus areas
  const focusAreas = [...new Set(workoutPlan.days.map(day => day.focus))];
  
  // Format the last adaptation time
  const formatAdaptationTime = (date: Date): string => {
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) {
      return 'just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    } else {
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) {
        return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
      } else {
        return date.toLocaleDateString();
      }
    }
  };
  
  return (
    <div className="workout-plan-overview">
      <div className="workout-plan-header">
        <div>
          <h2 className="workout-plan-title">{workoutPlan.name}</h2>
          <p className="workout-plan-description">{workoutPlan.description}</p>
          
          {lastAdaptationTime && (
            <div className="adaptation-status">
              <span className="adaptation-indicator">✓</span>
              <span className="adaptation-text">
                Plan adapted {formatAdaptationTime(lastAdaptationTime)}
              </span>
            </div>
          )}
          
          {adaptationInProgress && (
            <div className="adaptation-status in-progress">
              <span className="adaptation-indicator">⟳</span>
              <span className="adaptation-text">
                Adapting plan based on your feedback...
              </span>
            </div>
          )}
        </div>
        
        <div className="workout-plan-actions">
          {onGenerateNewPlan && (
            <button 
              className="action-button generate-button"
              onClick={onGenerateNewPlan}
            >
              Generate New Plan
            </button>
          )}
        </div>
      </div>
      
      <div className="plan-stats">
        <div className="stat-item">
          <span className="stat-value">{totalWorkoutDays}</span>
          <span className="stat-label">Workout Days</span>
        </div>
        
        <div className="stat-item">
          <span className="stat-value">{workoutPlan.days.length - totalWorkoutDays}</span>
          <span className="stat-label">Rest Days</span>
        </div>
        
        <div className="stat-item">
          <span className="stat-value">{totalExercises}</span>
          <span className="stat-label">Total Exercises</span>
        </div>
        
        <div className="stat-item">
          <span className="stat-value">{Math.round(totalExercises / totalWorkoutDays)}</span>
          <span className="stat-label">Exercises/Day</span>
        </div>
      </div>
      
      <div className="plan-details">
        <div className="detail-item">
          <span className="detail-label">Created:</span>
          <span className="detail-value">{creationDate}</span>
        </div>
        
        <div className="detail-item">
          <span className="detail-label">Focus Areas:</span>
          <span className="detail-value">{focusAreas.join(', ')}</span>
        </div>
        
        {workoutPlan.targetBodyAreas && workoutPlan.targetBodyAreas.length > 0 && (
          <div className="detail-item">
            <span className="detail-label">Target Body Areas:</span>
            <span className="detail-value">{workoutPlan.targetBodyAreas.join(', ')}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutPlanOverview;