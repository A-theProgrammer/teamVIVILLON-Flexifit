import { UserState, UserMetrics } from './types';
import { WorkoutPlan, UserModel } from '@/types/user';

export class UserProfiler {
  /**
   * Creates a user state object from application user data
   */
  public createUserState(user: UserModel, currentPlan: WorkoutPlan | null, feedbackHistory: any[]): UserState {
    // Calculate user metrics
    const metrics = this.calculateUserMetrics(user, feedbackHistory);
    
    // Extract experience level
    let experienceLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner';
    if (user.staticAttributes?.exerciseBackground?.experienceLevel) {
      experienceLevel = user.staticAttributes.exerciseBackground.experienceLevel;
    }
    
    // Calculate health status
    const healthStatus = user.staticAttributes?.basicInformation?.healthStatus || [];
    
    // Initialize or extract adaptive parameters
    const adaptiveParams = this.initializeAdaptiveParameters(user, experienceLevel);
    
    // Determine goals
    const primaryGoal = user.staticAttributes?.fitnessGoals?.primaryGoal || 'general_health';
    const targetGoals = [primaryGoal];
    
    // Get completed workout count
    const completedWorkouts = user.dynamicAttributes?.workoutProgress?.completedExercises?.length || 0;
    
    // Last workout date
    const lastWorkoutDate = user.dynamicAttributes?.workoutProgress?.lastWorkout 
      ? new Date(user.dynamicAttributes.workoutProgress.lastWorkout) 
      : undefined;
    
    return {
      userId: user.userId,
      currentPlan,
      feedbackHistory,
      metrics,
      adaptiveParams,
      experienceLevel,
      targetGoals,
      completedWorkouts,
      lastWorkoutDate,
      healthStatus
    };
  }
  
  /**
   * Calculate key user metrics
   */
  private calculateUserMetrics(user: UserModel, feedbackHistory: any[]): UserMetrics {
    // Calculate completion rate
    const completedExercises = user.dynamicAttributes?.workoutProgress?.completedExercises?.length || 0;
    const totalExercises = this.calculateTotalExercises(user);
    const completionRate = totalExercises > 0 ? completedExercises / totalExercises : 0;
    
    // Calculate consistency score
    const consistencyScore = this.calculateConsistencyScore(user);
    
    // Calculate improvement rate
    const improvementRate = this.calculateImprovementRate(feedbackHistory);
    
    // Calculate adherence score
    const adherenceScore = this.calculateAdherenceScore(user);
    
    return {
      completionRate,
      consistencyScore,
      improvementRate,
      adherenceScore
    };
  }
  
  private calculateTotalExercises(user: UserModel): number {
    // Calculate the total number of possible exercises in the user's plan
    let total = 0;
    if (user.dynamicAttributes?.savedWorkoutPlans) {
      for (const plan of user.dynamicAttributes.savedWorkoutPlans) {
        for (const day of plan.days) {
          total += day.exercises.length;
        }
      }
    }
    return total || 1; // Avoid division by zero
  }
  
  private calculateConsistencyScore(user: UserModel): number {
    // Calculate consistency based on user's weekly workout frequency
    const streak = user.dynamicAttributes?.workoutProgress?.streakDays || 0;
    // Max streak of 14 days for normalization
    return Math.min(streak / 14, 1);
  }
  
  private calculateImprovementRate(feedbackHistory: any[]): number {
    if (feedbackHistory.length < 2) return 0;
    
    // Calculate average trend in difficulty ratings
    const recentFeedbacks = feedbackHistory.slice(-10); // Last 10 feedbacks
    let difficultySum = 0;
    let changeSum = 0;
    
    for (let i = 1; i < recentFeedbacks.length; i++) {
      const prevDifficulty = recentFeedbacks[i-1].difficulty;
      const currDifficulty = recentFeedbacks[i].difficulty;
      difficultySum += currDifficulty;
      changeSum += (currDifficulty - prevDifficulty);
    }
    
    const avgDifficulty = difficultySum / (recentFeedbacks.length - 1);
    // Normalize improvement rate to -1 to 1 range
    return Math.max(-1, Math.min(1, changeSum / ((recentFeedbacks.length - 1) * avgDifficulty)));
  }
  
  private calculateAdherenceScore(user: UserModel): number {
    // Calculate adherence based on activity and plan completion
    const lastWorkoutString = user.dynamicAttributes?.workoutProgress?.lastWorkout;
    
    if (!lastWorkoutString) return 0;
    
    const lastWorkout = new Date(lastWorkoutString);
    const now = new Date();
    const daysSinceLastWorkout = (now.getTime() - lastWorkout.getTime()) / (1000 * 60 * 60 * 24);
    
    // If workout within last 7 days, calculate adherence
    if (daysSinceLastWorkout <= 7) {
      return Math.max(0, 1 - (daysSinceLastWorkout / 7));
    }
    
    return 0;
  }
  
  /**
   * Initialize or update adaptive parameters for a user
   */
  private initializeAdaptiveParameters(
    user: UserModel, 
    experienceLevel: 'beginner' | 'intermediate' | 'advanced'
  ) {
    // Set base parameters based on experience level
    let intensity, volume, frequency, restPeriod, progression;
    
    switch (experienceLevel) {
      case 'beginner':
        intensity = 0.5;    // Medium intensity
        volume = 0.4;       // Lower volume
        frequency = 3;      // 3 times per week
        restPeriod = 60;    // 60 second rest
        progression = 0.3;  // Slow progression
        break;
      case 'intermediate':
        intensity = 0.65;   // Medium-high intensity
        volume = 0.6;       // Medium volume
        frequency = 4;      // 4 times per week
        restPeriod = 45;    // 45 second rest
        progression = 0.4;  // Moderate progression
        break;
      case 'advanced':
        intensity = 0.8;    // High intensity
        volume = 0.8;       // High volume
        frequency = 5;      // 5 times per week
        restPeriod = 30;    // 30 second rest
        progression = 0.5;  // Fast progression
        break;
    }
    
    return {
      intensity,
      volume,
      frequency,
      restPeriod,
      progression
    };
  }
}