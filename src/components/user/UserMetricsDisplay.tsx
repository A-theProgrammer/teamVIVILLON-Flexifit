import React, { useMemo } from 'react';
import { UserModel } from '../../types/user';
import { UserFeedback } from '../../adaptiveEngine/types';
import './UserMetricsDisplay.css';

interface UserMetricsDisplayProps {
  user: UserModel;
  feedbackHistory: UserFeedback[];
}

const UserMetricsDisplay: React.FC<UserMetricsDisplayProps> = ({ user, feedbackHistory }) => {
  // Calculate metrics based on user data and feedback
  const metrics = useMemo(() => {
    // Get workout streak
    const streakDays = user.dynamicAttributes.workoutProgress?.streakDays || 0;
    
    // Calculate completion rate
    let completionRate = 0;
    const completedExercises = user.dynamicAttributes.workoutProgress?.completedExercises?.length || 0;
    const totalPlannedExercises = calculateTotalPlannedExercises(user);
    if (totalPlannedExercises > 0) {
      completionRate = (completedExercises / totalPlannedExercises) * 100;
    }
    
    // Calculate average workout difficulty and enjoyment from feedback
    let avgDifficulty = 0;
    let avgEnjoyment = 0;
    let avgFatigue = 0;
    
    if (feedbackHistory.length > 0) {
      avgDifficulty = feedbackHistory.reduce((sum, fb) => sum + fb.difficulty, 0) / feedbackHistory.length;
      
      // Only calculate if enjoyment is present in the feedback
      if (feedbackHistory[0].enjoyment !== undefined) {
        avgEnjoyment = feedbackHistory.reduce((sum, fb) => sum + (fb.enjoyment || 0), 0) / feedbackHistory.length;
      }
      
      avgFatigue = feedbackHistory.reduce((sum, fb) => sum + fb.fatigue, 0) / feedbackHistory.length;
    }
    
    // Calculate consistency score (simplified)
    const consistencyScore = calculateConsistencyScore(user);
    
    return {
      streakDays,
      completionRate,
      avgDifficulty,
      avgEnjoyment,
      avgFatigue,
      consistencyScore,
      totalWorkouts: feedbackHistory.length,
      lastWorkoutDate: user.dynamicAttributes.workoutProgress?.lastWorkout 
        ? new Date(user.dynamicAttributes.workoutProgress.lastWorkout)
        : null
    };
  }, [user, feedbackHistory]);
  
  // Calculate progress bar width based on metric value
  const getProgressWidth = (value: number, max: number): string => {
    return `${Math.min(100, (value / max) * 100)}%`;
  };

  // Determine color based on value
  const getColorClass = (value: number, thresholds: [number, number, number]): string => {
    const [low, medium, high] = thresholds;
    if (value < low) return 'metric-bar-low';
    if (value < medium) return 'metric-bar-medium';
    return 'metric-bar-high';
  };
  
  return (
    <div className="user-metrics-display">
      <h2>Performance Metrics</h2>
      
      <div className="metrics-content">
        <div className="metrics-overview">
          <div className="metric-item">
            <div className="metric-header">
              <span className="metric-label">Workout Streak</span>
              <span className="metric-value">{metrics.streakDays} days</span>
            </div>
            <div className="metric-progress-container">
              <div 
                className={`metric-progress-bar ${getColorClass(metrics.streakDays, [3, 7, 14])}`}
                style={{ width: getProgressWidth(metrics.streakDays, 30) }}
              ></div>
            </div>
          </div>
          
          <div className="metric-item">
            <div className="metric-header">
              <span className="metric-label">Completion Rate</span>
              <span className="metric-value">{metrics.completionRate.toFixed(1)}%</span>
            </div>
            <div className="metric-progress-container">
              <div 
                className={`metric-progress-bar ${getColorClass(metrics.completionRate, [60, 80, 90])}`}
                style={{ width: getProgressWidth(metrics.completionRate, 100) }}
              ></div>
            </div>
          </div>
          
          <div className="metric-item">
            <div className="metric-header">
              <span className="metric-label">Consistency Score</span>
              <span className="metric-value">{(metrics.consistencyScore * 100).toFixed(1)}%</span>
            </div>
            <div className="metric-progress-container">
              <div 
                className={`metric-progress-bar ${getColorClass(metrics.consistencyScore * 100, [60, 80, 90])}`}
                style={{ width: getProgressWidth(metrics.consistencyScore * 100, 100) }}
              ></div>
            </div>
          </div>
          
          {metrics.avgDifficulty > 0 && (
            <div className="metric-item">
              <div className="metric-header">
                <span className="metric-label">Average Difficulty</span>
                <span className="metric-value">{metrics.avgDifficulty.toFixed(1)}/5</span>
              </div>
              <div className="metric-progress-container">
                <div 
                  className={`metric-progress-bar ${getColorClass(metrics.avgDifficulty, [2, 3, 4])}`}
                  style={{ width: getProgressWidth(metrics.avgDifficulty, 5) }}
                ></div>
              </div>
            </div>
          )}
          
          {metrics.avgEnjoyment > 0 && (
            <div className="metric-item">
              <div className="metric-header">
                <span className="metric-label">Average Enjoyment</span>
                <span className="metric-value">{metrics.avgEnjoyment.toFixed(1)}/5</span>
              </div>
              <div className="metric-progress-container">
                <div 
                  className={`metric-progress-bar ${getColorClass(metrics.avgEnjoyment, [2, 3, 4])}`}
                  style={{ width: getProgressWidth(metrics.avgEnjoyment, 5) }}
                ></div>
              </div>
            </div>
          )}
          
          {metrics.avgFatigue > 0 && (
            <div className="metric-item">
              <div className="metric-header">
                <span className="metric-label">Average Fatigue</span>
                <span className="metric-value">{metrics.avgFatigue.toFixed(1)}/5</span>
              </div>
              <div className="metric-progress-container">
                <div 
                  className={`metric-progress-bar ${getColorClass(metrics.avgFatigue, [2, 3, 4])}`}
                  style={{ width: getProgressWidth(metrics.avgFatigue, 5) }}
                ></div>
              </div>
            </div>
          )}
        </div>
        
        <div className="metrics-summary">
          <div className="summary-item">
            <span className="summary-label">Total Workouts:</span>
            <span className="summary-value">{metrics.totalWorkouts}</span>
          </div>
          {metrics.lastWorkoutDate && (
            <div className="summary-item">
              <span className="summary-label">Last Workout:</span>
              <span className="summary-value">{metrics.lastWorkoutDate.toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function to calculate total planned exercises
function calculateTotalPlannedExercises(user: UserModel): number {
  let total = 0;
  
  if (user.dynamicAttributes.savedWorkoutPlans && user.dynamicAttributes.savedWorkoutPlans.length > 0) {
    // Consider only the most recent plan
    const latestPlan = user.dynamicAttributes.savedWorkoutPlans[user.dynamicAttributes.savedWorkoutPlans.length - 1];
    
    for (const day of latestPlan.days) {
      total += day.exercises.length;
    }
  }
  
  return total || 1; // Avoid division by zero
}

// Helper function to calculate consistency score (simplified)
function calculateConsistencyScore(user: UserModel): number {
  // Base consistency on streak and workout history
  const streakDays = user.dynamicAttributes.workoutProgress?.streakDays || 0;
  
  // For simplicity, we'll use a formula based on streak days
  // A perfect score would be for a streak equal to or greater than 14 days
  const maxStreakForPerfectScore = 14;
  
  return Math.min(streakDays / maxStreakForPerfectScore, 1);
}

export default UserMetricsDisplay;