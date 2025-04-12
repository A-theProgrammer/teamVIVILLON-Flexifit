import { UserState, UserMetrics, AdaptiveParameters } from './types';
import { WorkoutPlan, UserModel, WorkoutDay } from '../types/user';

export class UserProfiler {
  /**
   * Creates an enhanced user state object with improved profiling
   */
  public createUserState(user: UserModel, currentPlan: WorkoutPlan | null, feedbackHistory: any[]): UserState {
    // Calculate enhanced user metrics
    const metrics = this.calculateEnhancedUserMetrics(user, feedbackHistory);
    
    // Extract and enhance experience level determination
    const experienceLevel = this.determineExperienceLevel(user, feedbackHistory);
    
    // Calculate health status with more details
    const healthStatus = this.analyzeHealthStatus(user);
    
    // Initialize or extract adaptive parameters with more personalization
    const adaptiveParams = this.initializeAdaptiveParameters(user, experienceLevel, feedbackHistory);
    
    // Determine goals with better classification
    const targetGoals = this.determineUserGoals(user);
    
    // Get completed workout count
    const completedWorkouts = user.dynamicAttributes?.workoutProgress?.completedExercises?.length || 0;
    
    // Last workout date
    const lastWorkoutDate = user.dynamicAttributes?.workoutProgress?.lastWorkout 
      ? new Date(user.dynamicAttributes.workoutProgress.lastWorkout) 
      : undefined;
    
    // Extract preferred exercise time of day if available
    const preferredTimeOfDay = this.determinePreferredTime(user);
    
    // Analyze user's exercise preferences
    const exercisePreferences = this.analyzeExercisePreferences(feedbackHistory);
    
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
      healthStatus,
      preferredTimeOfDay,    // New field
      exercisePreferences,   // New field
      bodyMetrics: this.calculateBodyMetrics(user) // New field
    };
  }
  
  /**
   * Enhanced metric calculation with more performance indicators
   */
  private calculateEnhancedUserMetrics(user: UserModel, feedbackHistory: any[]): UserMetrics {
    // Calculate completion rate with more granularity
    const completedExercises = user.dynamicAttributes?.workoutProgress?.completedExercises?.length || 0;
    const totalExercises = this.calculateTotalExercises(user);
    const completionRate = totalExercises > 0 ? completedExercises / totalExercises : 0;
    
    // Calculate consistency score with recency bias
    const consistencyScore = this.calculateConsistencyScoreWithRecency(user);
    
    // Calculate improvement rate with trend analysis
    const improvementRate = this.calculateImprovementRate(feedbackHistory);
    
    // Calculate adherence score with pattern recognition
    const adherenceScore = this.calculateAdherenceScoreWithPatterns(user);
    
    // Calculate perceived effort score (new)
    const perceivedEffortScore = this.calculatePerceivedEffort(feedbackHistory);
    
    // Calculate exercise variety score (new)
    const varietyScore = this.calculateVarietyScore(user);
    
    // Calculate exercise balance score (new)
    const balanceScore = this.calculateBalanceScore(user);
    
    return {
      completionRate,
      consistencyScore,
      improvementRate,
      adherenceScore,
      perceivedEffortScore,  // New metric
      varietyScore,          // New metric
      balanceScore           // New metric
    };
  }
  
  /**
   * Calculate the total number of exercises in the user's plan with better tracking
   */
  private calculateTotalExercises(user: UserModel): number {
    // Calculate the total number of possible exercises in the user's plan
    let total = 0;
    const recentPlanThreshold = new Date();
    recentPlanThreshold.setMonth(recentPlanThreshold.getMonth() - 1); // Only count recent plans
    
    if (user.dynamicAttributes?.savedWorkoutPlans) {
      for (const plan of user.dynamicAttributes.savedWorkoutPlans) {
        // Only count recent plans
        if (new Date(plan.createdAt) > recentPlanThreshold) {
          for (const day of plan.days) {
            total += day.exercises.length;
          }
        }
      }
    }
    return total || 1; // Avoid division by zero
  }
  
  /**
   * Enhanced consistency score calculation with recency bias
   */
  private calculateConsistencyScoreWithRecency(user: UserModel): number {
    // Base consistency on user's weekly workout pattern with recency bias
    const streak = user.dynamicAttributes?.workoutProgress?.streakDays || 0;
    
    // Calculate days since last workout with recency factor
    let recencyFactor = 1.0;
    if (user.dynamicAttributes?.workoutProgress?.lastWorkout) {
      const lastWorkout = new Date(user.dynamicAttributes.workoutProgress.lastWorkout);
      const now = new Date();
      const daysSinceLastWorkout = (now.getTime() - lastWorkout.getTime()) / (1000 * 60 * 60 * 24);
      
      // Apply stronger recency bias - recent workouts boost consistency more
      if (daysSinceLastWorkout <= 2) {
        recencyFactor = 1.2; // Bonus for very recent activity
      } else if (daysSinceLastWorkout > 7) {
        recencyFactor = 0.8; // Penalty for long gaps
      }
    }
    
    // Normalize with recency factor
    return Math.min((streak / 14) * recencyFactor, 1);
  }
  
  /**
   * Calculate improvement rate with trend analysis
   */
  private calculateImprovementRate(feedbackHistory: any[]): number {
    if (feedbackHistory.length < 2) return 0;
    
    // Use weighted moving average for better trend detection
    const recentFeedbacks = feedbackHistory.slice(-10); // Last 10 feedbacks
    let weightedDifficultySum = 0;
    let weightedChangeSum = 0;
    let weightSum = 0;
    
    for (let i = 1; i < recentFeedbacks.length; i++) {
      const prevDifficulty = recentFeedbacks[i-1].difficulty;
      const currDifficulty = recentFeedbacks[i].difficulty;
      const weight = Math.pow(1.2, i); // Exponential recency weighting
      
      weightedDifficultySum += currDifficulty * weight;
      weightedChangeSum += (currDifficulty - prevDifficulty) * weight;
      weightSum += weight;
    }
    
    const avgDifficulty = weightedDifficultySum / weightSum;
    // Normalize improvement rate to -1 to 1 range with better sensitivity
    return Math.max(-1, Math.min(1, weightedChangeSum / (weightSum * avgDifficulty * 0.8)));
  }
  
  /**
   * Calculate adherence score with pattern recognition
   */
  private calculateAdherenceScoreWithPatterns(user: UserModel): number {
    // Basic adherence based on recency
    const lastWorkoutString = user.dynamicAttributes?.workoutProgress?.lastWorkout;
    
    if (!lastWorkoutString) return 0;
    
    const lastWorkout = new Date(lastWorkoutString);
    const now = new Date();
    const daysSinceLastWorkout = (now.getTime() - lastWorkout.getTime()) / (1000 * 60 * 60 * 24);
    
    // Base adherence score
    let adherenceScore = Math.max(0, 1 - (daysSinceLastWorkout / 7));
    
    // Add pattern analysis if behavior data exists
    if (user.dynamicAttributes?.behavioralData?.usageRecords) {
      const usageRecords = user.dynamicAttributes.behavioralData.usageRecords;
      
      // Calculate day-of-week patterns
      const dayFrequency: Record<number, number> = {};
      let totalDays = 0;
      
      for (const record of usageRecords) {
        const day = new Date(record.timestamp).getDay();
        dayFrequency[day] = (dayFrequency[day] || 0) + 1;
        totalDays++;
      }
      
      // Calculate pattern consistency (higher is better)
      const patternStrength = Object.values(dayFrequency).reduce((sum, count) => {
        // Higher counts on specific days indicate stronger patterns
        return sum + Math.pow(count / totalDays, 2);
      }, 0);
      
      // Adjust adherence based on pattern strength
      adherenceScore = adherenceScore * 0.7 + patternStrength * 0.3;
    }
    
    return adherenceScore;
  }
  
  /**
   * Calculate perceived effort (new metric)
   */
  private calculatePerceivedEffort(feedbackHistory: any[]): number {
    if (feedbackHistory.length === 0) return 0.5; // Default mid-level
    
    // Recent feedbacks with recency weighting
    const recentFeedbacks = feedbackHistory.slice(-5);
    let weightedEffortSum = 0;
    let weightSum = 0;
    
    for (let i = 0; i < recentFeedbacks.length; i++) {
      const weight = (i + 1) / recentFeedbacks.length; // More weight to more recent
      // Combine difficulty and fatigue for effort perception
      const effort = (recentFeedbacks[i].difficulty + recentFeedbacks[i].fatigue) / 10;
      weightedEffortSum += effort * weight;
      weightSum += weight;
    }
    
    return weightSum > 0 ? weightedEffortSum / weightSum : 0.5;
  }
  
  /**
   * Calculate exercise variety score (new metric)
   */
  private calculateVarietyScore(user: UserModel): number {
    // Default variety score
    if (!user.dynamicAttributes?.trainingData || user.dynamicAttributes.trainingData.length === 0) {
      return 0.5;
    }
    
    // Calculate variety based on unique exercises used
    const trainingData = user.dynamicAttributes.trainingData;
    const uniqueExercises = new Set();
    
    for (const session of trainingData) {
      for (const exercise of session.exercises) {
        uniqueExercises.add(exercise.name);
      }
    }
    
    // Normalize: More than 20 unique exercises is excellent variety
    return Math.min(uniqueExercises.size / 20, 1);
  }
  
  /**
   * Calculate body balance score (new metric)
   */
  private calculateBalanceScore(user: UserModel): number {
    if (!user.dynamicAttributes?.trainingData || user.dynamicAttributes.trainingData.length === 0) {
      return 0.5;
    }
    
type BodyArea = 'upper' | 'lower' | 'core' | 'cardio';

const bodyAreas: Record<BodyArea, number> = {
  upper: 0,
  lower: 0,
  core: 0,
  cardio: 0
};

const exerciseAreaMap: Record<string, BodyArea> = {
  'Push-Ups': 'upper',
  'Bench Press': 'upper',
  'Squats': 'lower',
  'Lunges': 'lower',
  'Plank': 'core',
  'Crunches': 'core',
  'Running': 'cardio',
  'Jumping Jacks': 'cardio'
};

    
    // Count exercises per area
    let totalExercises = 0;
    for (const session of user.dynamicAttributes.trainingData) {
      for (const exercise of session.exercises) {
        const area = exerciseAreaMap[exercise.name] || 'upper'; // Default to upper if unknown
        bodyAreas[area]++;
        totalExercises++;
      }
    }
    
    // Calculate balance score (higher is better)
    const idealRatio = totalExercises / 4; // Perfect balance would have 25% in each area
    const deviations = Object.values(bodyAreas).map(count => 
      Math.abs(count - idealRatio) / idealRatio
    );
    
    // Average deviation (lower is better)
    const avgDeviation = deviations.reduce((sum, val) => sum + val, 0) / 4;
    
    // Convert to 0-1 score (higher is better)
    return Math.max(0, 1 - avgDeviation);
  }
  
  /**
   * Better experience level determination
   */
  private determineExperienceLevel(user: UserModel, feedbackHistory: any[]): 'beginner' | 'intermediate' | 'advanced' {
    // Start with user-declared experience level
    let experienceLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner';
    if (user.staticAttributes?.exerciseBackground?.experienceLevel) {
      experienceLevel = user.staticAttributes.exerciseBackground.experienceLevel;
    }
    
    // If user has completed enough workouts, reevaluate based on performance
    if (feedbackHistory.length >= 10) {
      // Calculate average difficulty and completion time metrics
      const avgDifficulty = feedbackHistory.reduce((sum, fb) => sum + fb.difficulty, 0) / feedbackHistory.length;
      
      // Calculate completion rate
      const completedExercises = user.dynamicAttributes?.workoutProgress?.completedExercises?.length || 0;
      const totalExercises = this.calculateTotalExercises(user);
      const completionRate = totalExercises > 0 ? completedExercises / totalExercises : 0;
      
      // Adaptive experience level determination
      if (avgDifficulty < 2.5 && completionRate > 0.8) {
        // User finds workouts easy and completes most exercises
        experienceLevel = experienceLevel === 'beginner' ? 'intermediate' : 'advanced';
      } else if (avgDifficulty > 4 && completionRate < 0.6) {
        // User finds workouts very difficult and doesn't complete many
        experienceLevel = experienceLevel === 'advanced' ? 'intermediate' : 'beginner';
      }
    }
    
    return experienceLevel;
  }
  
  /**
   * Enhanced health status analysis
   */
  private analyzeHealthStatus(user: UserModel): string[] {
    // Start with declared health status
    const healthStatus = user.staticAttributes?.basicInformation?.healthStatus || [];
    
    // Could expand with derived health indicators based on performance
    return healthStatus;
  }
  
  /**
   * Enhanced user goals determination
   */
  private determineUserGoals(user: UserModel): string[] {
    // Primary goal from user profile
    const primaryGoal = user.staticAttributes?.fitnessGoals?.primaryGoal || 'general_health';
    const targetGoals = [primaryGoal];
    
    // Could add secondary goals based on behavior
    return targetGoals;
  }
  
  /**
   * Determine preferred workout time
   */
  private determinePreferredTime(user: UserModel): string | undefined {
    if (!user.dynamicAttributes?.behavioralData?.usageRecords) {
      return undefined;
    }
    
    const usageRecords = user.dynamicAttributes.behavioralData.usageRecords;
    const timeDistribution: Record<string, number> = {
      'morning': 0,   // 5am-11am
      'afternoon': 0, // 11am-5pm
      'evening': 0,   // 5pm-10pm
      'night': 0      // 10pm-5am
    };
    
    for (const record of usageRecords) {
      const hour = new Date(record.timestamp).getHours();
      if (hour >= 5 && hour < 11) timeDistribution.morning++;
      else if (hour >= 11 && hour < 17) timeDistribution.afternoon++;
      else if (hour >= 17 && hour < 22) timeDistribution.evening++;
      else timeDistribution.night++;
    }
    
    // Find time with highest frequency
    let maxTime: string | undefined;
    let maxCount = 0;
    
    for (const [time, count] of Object.entries(timeDistribution)) {
      if (count > maxCount) {
        maxCount = count;
        maxTime = time;
      }
    }
    
    return maxTime;
  }
  
  /**
   * Analyze exercise preferences from feedback
   */
  private analyzeExercisePreferences(feedbackHistory: any[]): Record<string, number> {
    const preferences: Record<string, number> = {};
    
    if (feedbackHistory.length === 0) {
      return preferences;
    }
    
    // Group feedback by exercise
    const exerciseFeedback: Record<string, any[]> = {};
    
    for (const feedback of feedbackHistory) {
      if (!exerciseFeedback[feedback.exerciseId]) {
        exerciseFeedback[feedback.exerciseId] = [];
      }
      exerciseFeedback[feedback.exerciseId].push(feedback);
    }
    
    // Calculate preference score for each exercise
    for (const [exerciseId, feedbacks] of Object.entries(exerciseFeedback)) {
      if (feedbacks.length === 0) continue;
      
      // Calculate average enjoyment as preference indicator
      const avgEnjoyment = feedbacks.reduce((sum, fb) => sum + fb.enjoyment, 0) / feedbacks.length;
      preferences[exerciseId] = avgEnjoyment;
    }
    
    return preferences;
  }
  
  /**
   * Calculate body metrics including BMI and ideal workout parameters
   */
  private calculateBodyMetrics(user: UserModel): any {
    // Basic info
    const height = user.staticAttributes?.basicInformation?.height || 170; // cm
    const weight = user.staticAttributes?.basicInformation?.weight || 70;  // kg
    const age = user.staticAttributes?.basicInformation?.age || 30;
    const gender = user.staticAttributes?.basicInformation?.gender || 'other';
    
    // Calculate BMI
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    
    // Calculate ideal rep ranges based on goals and body metrics
    const goalType = user.staticAttributes?.fitnessGoals?.primaryGoal || 'general_health';
    
    let idealRepRange: [number, number];
    switch (goalType) {
      case 'muscle_gain':
        idealRepRange = [6, 12];
        break;
      case 'fat_loss':
        idealRepRange = [12, 15];
        break;
      case 'endurance':
        idealRepRange = [15, 20];
        break;
      default:
        idealRepRange = [8, 15];
    }
    
    // Adjust for age - older users generally benefit from slightly higher reps
    if (age > 50) {
      idealRepRange = [idealRepRange[0] + 2, idealRepRange[1] + 2];
    }
    
    return {
      bmi,
      bmiCategory: this.getBmiCategory(bmi),
      idealRepRange,
      recommendedIntensity: this.getRecommendedIntensity(goalType, age, bmi)
    };
  }
  
  /**
   * Get BMI category
   */
  private getBmiCategory(bmi: number): string {
    if (bmi < 18.5) return 'underweight';
    if (bmi < 25) return 'normal';
    if (bmi < 30) return 'overweight';
    return 'obese';
  }
  
  /**
   * Get recommended intensity based on user parameters
   */
  private getRecommendedIntensity(goalType: string, age: number, bmi: number): number {
    let baseIntensity = 0.7; // Default (0-1 scale)
    
    // Adjust by goal
    if (goalType === 'muscle_gain') baseIntensity += 0.1;
    if (goalType === 'endurance') baseIntensity -= 0.1;
    
    // Adjust by age
    if (age > 50) baseIntensity -= 0.1;
    if (age < 30) baseIntensity += 0.05;
    
    // Adjust by BMI
    if (bmi > 30) baseIntensity -= 0.1;
    if (bmi < 18.5) baseIntensity -= 0.05;
    
    return Math.min(Math.max(baseIntensity, 0.4), 0.9);
  }
  
  /**
   * Enhanced adaptive parameters initialization
   */
  private initializeAdaptiveParameters(
    user: UserModel, 
    experienceLevel: 'beginner' | 'intermediate' | 'advanced',
    feedbackHistory: any[]
  ): AdaptiveParameters {
    // Base parameters based on experience level
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
    
    // Adjust based on user health status
    const healthStatus = user.staticAttributes?.basicInformation?.healthStatus || [];
    if (healthStatus.includes('joint_pain') || healthStatus.includes('recovering_injury')) {
      intensity *= 0.8;
      volume *= 0.9;
      restPeriod *= 1.2;
      progression *= 0.7;
    }
    
    // Adjust based on age
    const age = user.staticAttributes?.basicInformation?.age || 30;
    if (age > 50) {
      intensity *= 0.9;
      restPeriod *= 1.1;
      progression *= 0.9;
    }
    
    // Adjust based on feedback if available
    if (feedbackHistory.length > 0) {
      const recentFeedbacks = feedbackHistory.slice(-3);
      const avgDifficulty = recentFeedbacks.reduce((sum, fb) => sum + fb.difficulty, 0) / recentFeedbacks.length;
      const avgFatigue = recentFeedbacks.reduce((sum, fb) => sum + fb.fatigue, 0) / recentFeedbacks.length;
      
      // If workouts consistently too difficult, reduce parameters
      if (avgDifficulty > 4.2) {
        intensity *= 0.9;
        volume *= 0.9;
        restPeriod *= 1.1;
      }
      
      // If workouts consistently too easy, increase parameters
      if (avgDifficulty < 2.5) {
        intensity *= 1.1;
        volume *= 1.1;
        restPeriod *= 0.9;
      }
      
      // If fatigue is high, adjust recovery
      if (avgFatigue > 4) {
        restPeriod *= 1.2;
        frequency = Math.max(frequency - 1, 2);
      }
    }
    
    // Add periodization factor (new)
    const periodizationFactor = 0.1; // Base periodization amplitude
    
    return {
      intensity,
      volume,
      frequency,
      restPeriod,
      progression,
      periodizationFactor // New parameter
    };
  }
}