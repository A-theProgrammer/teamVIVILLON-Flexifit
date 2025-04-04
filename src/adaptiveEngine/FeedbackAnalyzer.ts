import { UserState, UserFeedback, ProgressionLevel, UserMetrics } from './types';

export class FeedbackAnalyzer {
  /**
   * Analyze user state and feedback to determine progression level
   */
  public analyzeUserProgression(userState: UserState): ProgressionLevel {
    // If not enough data, use default progression
    if (userState.completedWorkouts < 3) {
      return ProgressionLevel.NormalProgress;
    }
    
    // Extract key metrics
    const { metrics, feedbackHistory } = userState;
    
    // Check if should deload
    if (this.shouldDeload(feedbackHistory, metrics)) {
      return ProgressionLevel.Deload;
    }
    
    // Calculate progress score
    const progressScore = this.calculateProgressScore(userState);
    
    // Determine progression level based on score
    if (progressScore > 0.85) {
      return ProgressionLevel.Breakthrough;
    } else if (progressScore > 0.7) {
      return ProgressionLevel.FastProgress;
    } else if (progressScore > 0.5) {
      return ProgressionLevel.NormalProgress;
    } else if (progressScore > 0.3) {
      return ProgressionLevel.SlowProgress;
    } else {
      return ProgressionLevel.Maintenance;
    }
  }
  
  /**
   * Calculate progress score (0-1)
   */
  private calculateProgressScore(userState: UserState): number {
    const { metrics, feedbackHistory } = userState;
    
    // Calculate average difficulty from recent feedback
    const recentFeedbacks = feedbackHistory.slice(-5);
    const avgDifficulty = recentFeedbacks.length > 0
      ? recentFeedbacks.reduce((sum, fb) => sum + fb.difficulty, 0) / recentFeedbacks.length
      : 3; // Default to medium difficulty
    
    const difficultyScore = this.calculateDifficultyScore(avgDifficulty);
    const completionScore = metrics.completionRate;
    const consistencyScore = metrics.consistencyScore;
    const improvementScore = (metrics.improvementRate + 1) / 2; // Convert to 0-1 range
    
    // Weight the factors and calculate weighted average
    return (
      difficultyScore * 0.35 +
      completionScore * 0.25 +
      consistencyScore * 0.25 +
      improvementScore * 0.15
    );
  }
  
  /**
   * Convert difficulty rating to progress score
   * Optimal difficulty is around 3.5 (medium-high), too easy or hard impedes progress
   */
  private calculateDifficultyScore(avgDifficulty: number): number {
    // Ideal difficulty is 3.5 (out of 5)
    // If too easy or too hard, progress score is reduced
    const optimalDifficulty = 3.5;
    const deviation = Math.abs(avgDifficulty - optimalDifficulty);
    
    // Convert 0-2.5 deviation to 1-0 score
    return Math.max(0, 1 - (deviation / 2.5));
  }
  
  /**
   * Determine if deload is needed
   */
  private shouldDeload(feedbackHistory: UserFeedback[], metrics: UserMetrics): boolean {
    if (feedbackHistory.length < 5) return false;
    
    // Get recent feedback
    const recentFeedbacks = feedbackHistory.slice(-5);
    
    // Calculate average fatigue
    const avgFatigue = recentFeedbacks.reduce((sum, fb) => sum + fb.fatigue, 0) / recentFeedbacks.length;
    
    // If average fatigue is high and completion rate is dropping, recommend deload
    const highFatigue = avgFatigue > 4.2;
    const lowCompletion = metrics.completionRate < 0.6;
    const negativeImprovement = metrics.improvementRate < -0.3;
    
    return (highFatigue && (lowCompletion || negativeImprovement));
  }
  
  /**
   * Identify unsuitable exercises based on user feedback
   */
  public identifyProblematicExercises(feedbackHistory: UserFeedback[]): string[] {
    if (feedbackHistory.length < 3) return [];
    
    const exerciseFeedback: Record<string, UserFeedback[]> = {};
    
    // Group feedback by exercise ID
    for (const feedback of feedbackHistory) {
      if (!exerciseFeedback[feedback.exerciseId]) {
        exerciseFeedback[feedback.exerciseId] = [];
      }
      exerciseFeedback[feedback.exerciseId].push(feedback);
    }
    
    const problematicExercises: string[] = [];
    
    // Analyze feedback for each exercise
    for (const [exerciseId, feedbacks] of Object.entries(exerciseFeedback)) {
      if (feedbacks.length < 2) continue;
      
      // Calculate average enjoyment and difficulty
      const avgEnjoyment = feedbacks.reduce((sum, fb) => sum + fb.enjoyment, 0) / feedbacks.length;
      const avgDifficulty = feedbacks.reduce((sum, fb) => sum + fb.difficulty, 0) / feedbacks.length;
      
      // If exercise is too unenjoyable or consistently too difficult, mark as problematic
      if (avgEnjoyment < 2 || (avgDifficulty > 4.5 && feedbacks.length >= 3)) {
        problematicExercises.push(exerciseId);
      }
    }
    
    return problematicExercises;
  }
}