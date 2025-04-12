import { UserState, UserFeedback, ProgressionLevel, UserMetrics } from './types';

export class FeedbackAnalyzer {
  /**
   * Analyze user state and feedback to determine progression level with enhanced logic
   */
  public analyzeUserProgression(userState: UserState): ProgressionLevel {
    // If not enough data, use adaptive default progression based on experience
    if (userState.completedWorkouts < 3) {
      return this.getDefaultProgressionByExperience(userState.experienceLevel);
    }
    
    // Extract key metrics
    const { metrics, feedbackHistory, lastWorkoutDate } = userState;
    
    // Check if periodization suggests deload
    if (this.isPeriodizationDeloadNeeded(userState)) {
      return ProgressionLevel.Deload;
    }
    
    // Check if fatigue-based deload is needed
    if (this.shouldDeload(feedbackHistory, metrics)) {
      return ProgressionLevel.Deload;
    }
    
    // Check for consistency issues
    if (this.hasConsistencyIssues(userState)) {
      return ProgressionLevel.Maintenance;
    }
    
    // Calculate enhanced progress score with more dimensions
    const progressScore = this.calculateEnhancedProgressScore(userState);
    
    // Determine progression level based on score with more granular progression levels
    if (progressScore > 0.85) {
      return ProgressionLevel.Breakthrough;
    } else if (progressScore > 0.7) {
      return ProgressionLevel.FastProgress;
    } else if (progressScore > 0.55) {
      return ProgressionLevel.ModerateProgress;  // New level
    } else if (progressScore > 0.4) {
      return ProgressionLevel.NormalProgress;
    } else if (progressScore > 0.25) {
      return ProgressionLevel.SlowProgress;
    } else if (progressScore > 0.1) {
      return ProgressionLevel.VerySlowProgress;  // New level
    } else {
      return ProgressionLevel.Maintenance;
    }
  }
  
  /**
   * Get default progression level based on experience level
   */
  private getDefaultProgressionByExperience(experienceLevel: string): ProgressionLevel {
    switch (experienceLevel) {
      case 'beginner':
        return ProgressionLevel.FastProgress; // Beginners progress faster initially
      case 'intermediate':
        return ProgressionLevel.NormalProgress;
      case 'advanced':
        return ProgressionLevel.SlowProgress; // Advanced users progress slower
      default:
        return ProgressionLevel.NormalProgress;
    }
  }
  
  /**
   * Check if periodization cycle suggests a deload
   */
  private isPeriodizationDeloadNeeded(userState: UserState): boolean {
    // Check if there's enough workout history
    if (userState.completedWorkouts < 12) return false;
    
    // Use 4-week cycles (3 weeks progression, 1 week deload)
    const cycleLength = 4;
    const currentCyclePosition = userState.completedWorkouts % cycleLength;
    
    // Week 4 in the cycle is deload week
    if (currentCyclePosition === 0) {
      // Only deload if intensity and volume are high enough
      if (userState.adaptiveParams.intensity > 0.7 && userState.adaptiveParams.volume > 0.7) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Calculate enhanced progress score with more dimensions (0-1)
   */
  private calculateEnhancedProgressScore(userState: UserState): number {
    const { metrics, feedbackHistory, experienceLevel } = userState;
    
    // Calculate average difficulty from recent feedback with recency bias
    const recentFeedbacks = feedbackHistory.slice(-5);
    let weightedDifficultySum = 0;
    let totalWeight = 0;
    
    for (let i = 0; i < recentFeedbacks.length; i++) {
      const weight = (i + 1); // More weight to recent feedback
      weightedDifficultySum += recentFeedbacks[i].difficulty * weight;
      totalWeight += weight;
    }
    
    const avgDifficulty = totalWeight > 0 
      ? weightedDifficultySum / totalWeight
      : 3; // Default to medium difficulty
    
    // Calculate weighted scores
    const difficultyScore = this.calculateDifficultyScore(avgDifficulty, experienceLevel);
    const completionScore = metrics.completionRate;
    const consistencyScore = metrics.consistencyScore;
    const improvementRate = metrics.improvementRate;
    const improvementScore = (improvementRate + 1) / 2; // Convert to 0-1 range
    
    // Add new metrics if available
    const varietyScore = metrics.varietyScore || 0.5;
    const balanceScore = metrics.balanceScore || 0.5;
    const adherenceScore = metrics.adherenceScore;
    
    // Calculate enjoyment factor from recent feedback
    const enjoymentScore = this.calculateEnjoymentScore(recentFeedbacks);
    
    // Apply experience-based weighting - different factors matter more at different levels
    let weights;
    switch (experienceLevel) {
      case 'beginner':
        // For beginners, enjoyment and adherence are more important for progress
        weights = {
          difficulty: 0.15,
          completion: 0.2,
          consistency: 0.15,
          improvement: 0.1,
          variety: 0.1,
          balance: 0.05,
          adherence: 0.15,
          enjoyment: 0.1
        };
        break;
      case 'intermediate':
        // For intermediates, balanced approach
        weights = {
          difficulty: 0.2,
          completion: 0.15,
          consistency: 0.15,
          improvement: 0.15,
          variety: 0.1,
          balance: 0.1,
          adherence: 0.1,
          enjoyment: 0.05
        };
        break;
      case 'advanced':
        // For advanced, difficulty and improvement matter more
        weights = {
          difficulty: 0.25,
          completion: 0.1,
          consistency: 0.1,
          improvement: 0.2,
          variety: 0.15,
          balance: 0.1,
          adherence: 0.05,
          enjoyment: 0.05
        };
        break;
      default:
        weights = {
          difficulty: 0.2,
          completion: 0.15,
          consistency: 0.15,
          improvement: 0.15,
          variety: 0.1,
          balance: 0.1,
          adherence: 0.1,
          enjoyment: 0.05
        };
    }
    
    // Calculate weighted progress score
    return (
      difficultyScore * weights.difficulty +
      completionScore * weights.completion +
      consistencyScore * weights.consistency +
      improvementScore * weights.improvement +
      varietyScore * weights.variety +
      balanceScore * weights.balance +
      adherenceScore * weights.adherence +
      enjoymentScore * weights.enjoyment
    );
  }
  
  /**
   * Calculate difficulty score with experience-based optimal difficulty
   */
  private calculateDifficultyScore(avgDifficulty: number, experienceLevel: string): number {
    // Optimal difficulty varies by experience level
    let optimalDifficulty;
    
    switch (experienceLevel) {
      case 'beginner':
        optimalDifficulty = 3.0; // Beginners benefit from slightly easier workouts
        break;
      case 'intermediate':
        optimalDifficulty = 3.5; // Moderately challenging for intermediates
        break;
      case 'advanced':
        optimalDifficulty = 4.0; // Advanced users need more challenge
        break;
      default:
        optimalDifficulty = 3.5;
    }
    
    // Calculate deviation from optimal difficulty
    const deviation = Math.abs(avgDifficulty - optimalDifficulty);
    
    // Score decreases with deviation, but allow more range for advanced users
    const toleranceFactor = experienceLevel === 'advanced' ? 3.0 : 
                            experienceLevel === 'intermediate' ? 2.5 : 2.0;
    
    // Convert deviation to 1-0 score
    return Math.max(0, 1 - (deviation / toleranceFactor));
  }
  
  /**
   * Calculate enjoyment score from feedback
   */
  private calculateEnjoymentScore(feedbacks: UserFeedback[]): number {
    if (feedbacks.length === 0) return 0.5; // Default mid-level
    
    // Calculate average enjoyment from feedback
    const avgEnjoyment = feedbacks.reduce((sum, fb) => sum + fb.enjoyment, 0) / feedbacks.length;
    
    // Normalize to 0-1 range (5-point scale)
    return avgEnjoyment / 5;
  }
  
  /**
   * Enhanced deload detection with multiple factors
   */
  private shouldDeload(feedbackHistory: UserFeedback[], metrics: UserMetrics): boolean {
    if (feedbackHistory.length < 5) return false;
    
    // Get recent feedback with more emphasis on trend
    const recentFeedbacks = feedbackHistory.slice(-7);
    
    // Calculate average fatigue
    const avgFatigue = recentFeedbacks.reduce((sum, fb) => sum + fb.fatigue, 0) / recentFeedbacks.length;
    
    // Calculate fatigue trend (increasing = positive, decreasing = negative)
    const firstHalf = recentFeedbacks.slice(0, Math.floor(recentFeedbacks.length / 2));
    const secondHalf = recentFeedbacks.slice(Math.floor(recentFeedbacks.length / 2));
    
    const firstHalfAvg = firstHalf.reduce((sum, fb) => sum + fb.fatigue, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, fb) => sum + fb.fatigue, 0) / secondHalf.length;
    
    const fatigueTrend = secondHalfAvg - firstHalfAvg;
    
    // Enhanced deload indicators
    const highFatigue = avgFatigue > 4.0;
    const increasingFatigue = fatigueTrend > 0.3;
    const lowCompletion = metrics.completionRate < 0.65;
    const negativeImprovement = metrics.improvementRate < -0.25;
    const lowEnjoyment = this.calculateAverageEnjoyment(recentFeedbacks) < 2.5;
    
    // Multiple deload scenarios
    return (
      // Classic high fatigue scenario
      (highFatigue && (lowCompletion || negativeImprovement)) ||
      
      // Increasing fatigue with performance issues
      (increasingFatigue && avgFatigue > 3.5 && (lowCompletion || negativeImprovement)) ||
      
      // Extreme fatigue regardless of other factors
      (avgFatigue > 4.5) ||
      
      // Low enjoyment combined with fatigue and performance metrics
      (lowEnjoyment && avgFatigue > 3.5 && (lowCompletion || negativeImprovement))
    );
  }
  
  /**
   * Calculate average enjoyment
   */
  private calculateAverageEnjoyment(feedbacks: UserFeedback[]): number {
    if (feedbacks.length === 0) return 3; // Default mid-level
    return feedbacks.reduce((sum, fb) => sum + fb.enjoyment, 0) / feedbacks.length;
  }
  
  /**
   * Check for consistency issues in user workouts
   */
  private hasConsistencyIssues(userState: UserState): boolean {
    const { metrics, lastWorkoutDate } = userState;
    
    // Consistency issues detection
    if (!lastWorkoutDate) return false;
    
    // Check if it's been a while since last workout (over 10 days)
    const now = new Date();
    const daysSinceLastWorkout = (now.getTime() - lastWorkoutDate.getTime()) / (1000 * 60 * 60 * 24);
    
    // Very low consistency or long break
    const veryLowConsistency = metrics.consistencyScore < 0.3;
    const longBreak = daysSinceLastWorkout > 10;
    
    // If user is returning after a break, maintenance is better than progression
    return veryLowConsistency || longBreak;
  }
  
  /**
   * Identify unsuitable exercises based on user feedback with advanced detection
   * Returns array of problematic exercises with reason and severity
   */
  public identifyProblematicExercises(feedbackHistory: UserFeedback[]): Array<{id: string, reason: string, severity: number}> {
    if (feedbackHistory.length < 3) return [];
    
    const exerciseFeedback: Record<string, UserFeedback[]> = {};
    
    // Group feedback by exercise ID
    for (const feedback of feedbackHistory) {
      if (!exerciseFeedback[feedback.exerciseId]) {
        exerciseFeedback[feedback.exerciseId] = [];
      }
      exerciseFeedback[feedback.exerciseId].push(feedback);
    }
    
    const problematicExercises: Array<{id: string, reason: string, severity: number}> = [];
    
    // Analyze feedback for each exercise with more advanced indicators
    for (const [exerciseId, feedbacks] of Object.entries(exerciseFeedback)) {
      if (feedbacks.length < 2) continue;
      
      // Sort feedbacks by date to look at trends
      feedbacks.sort((a, b) => a.completionTime - b.completionTime);
      
      // Calculate metrics
      const avgEnjoyment = feedbacks.reduce((sum, fb) => sum + fb.enjoyment, 0) / feedbacks.length;
      const avgDifficulty = feedbacks.reduce((sum, fb) => sum + fb.difficulty, 0) / feedbacks.length;
      const avgFatigue = feedbacks.reduce((sum, fb) => sum + fb.fatigue, 0) / feedbacks.length;
      
      // Check for trends in enjoyment and difficulty
      const firstHalf = feedbacks.slice(0, Math.floor(feedbacks.length / 2));
      const secondHalf = feedbacks.slice(Math.floor(feedbacks.length / 2));
      
      const enjoymentTrend = 
        secondHalf.reduce((sum, fb) => sum + fb.enjoyment, 0) / secondHalf.length - 
        firstHalf.reduce((sum, fb) => sum + fb.enjoyment, 0) / firstHalf.length;
      
      const difficultyTrend = 
        secondHalf.reduce((sum, fb) => sum + fb.difficulty, 0) / secondHalf.length - 
        firstHalf.reduce((sum, fb) => sum + fb.difficulty, 0) / firstHalf.length;
      
      // Analyze notes for keywords if available
      const painMentioned = feedbacks.some(fb => 
        fb.notes?.toLowerCase().includes('pain') || 
        fb.notes?.toLowerCase().includes('hurt') ||
        fb.notes?.toLowerCase().includes('injur')
      );
      
      // Different problematic scenarios with severity ratings
      
      // Scenario 1: Exercise is consistently unenjoyable
      if (avgEnjoyment < 2 && enjoymentTrend <= 0) {
        problematicExercises.push({
          id: exerciseId,
          reason: 'Consistently low enjoyment',
          severity: 0.8
        });
      }
      
      // Scenario 2: Exercise is becoming less enjoyable over time
      else if (enjoymentTrend < -0.7 && feedbacks.length >= 3) {
        problematicExercises.push({
          id: exerciseId,
          reason: 'Declining enjoyment',
          severity: 0.6
        });
      }
      
      // Scenario 3: Exercise is too difficult without improvement
      else if (avgDifficulty > 4.3 && difficultyTrend >= 0 && feedbacks.length >= 3) {
        problematicExercises.push({
          id: exerciseId,
          reason: 'Consistently too difficult',
          severity: 0.7
        });
      }
      
      // Scenario 4: Exercise causes excessive fatigue
      else if (avgFatigue > 4.5 && feedbacks.length >= 2) {
        problematicExercises.push({
          id: exerciseId,
          reason: 'Causes excessive fatigue',
          severity: 0.6
        });
      }
      
      // Scenario 5: Pain or injury mentioned
      else if (painMentioned) {
        problematicExercises.push({
          id: exerciseId,
          reason: 'Potential pain or discomfort',
          severity: 0.9
        });
      }
    }
    
    // Sort by severity (highest first)
    return problematicExercises.sort((a, b) => b.severity - a.severity);
  }
  
  /**
   * Get simplified list of problematic exercise IDs
   * For backward compatibility
   */
  public getProblematicExerciseIds(feedbackHistory: UserFeedback[]): string[] {
    return this.identifyProblematicExercises(feedbackHistory).map(item => item.id);
  }
}