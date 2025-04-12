import { 
  UserState, 
  AdjustmentResult, 
  ExerciseAdjustment, 
  PlanStructureChange,
  ProgressionLevel,
  AdaptiveParameters,
  UserFeedback
} from './types';
import { WorkoutPlan, WorkoutExercise, WorkoutDay } from '../types/user';
import { getExerciseForFocus } from '../utils/workoutGenerator';

/**
 * Enhanced WorkoutAdjuster class with improved adaptive logic
 */
export class WorkoutAdjuster {
  // Exercise similarity mapping for smart replacements
  private exerciseSimilarityMap: Record<string, string[]> = {
    'Push-Ups': ['Bench Press', 'Incline Push-Ups', 'Diamond Push-Ups', 'Dumbbell Chest Press'],
    'Bench Press': ['Push-Ups', 'Incline Bench Press', 'Dumbbell Chest Press', 'Cable Chest Press'],
    'Squats': ['Leg Press', 'Lunges', 'Bulgarian Split Squats', 'Goblet Squats'],
    'Deadlifts': ['Romanian Deadlifts', 'Good Mornings', 'Glute Bridges', 'Kettlebell Swings'],
    'Pull-Ups': ['Lat Pulldown', 'Chin-Ups', 'Inverted Rows', 'Assisted Pull-Ups'],
    'Plank': ['Ab Rollouts', 'Mountain Climbers', 'Side Planks', 'Hollow Body Hold'],
    // Add more mappings as needed
  };
  
  // Minimum days between training same body part (for frequency planning)
  private bodyPartRecoveryMap: Record<string, number> = {
    'Chest': 2,
    'Back': 2,
    'Legs': 2,
    'Shoulders': 2,
    'Arms': 1,
    'Core': 1,
    'Cardio': 0
  };
  
  // Map exercises to body parts for recovery planning
  private exerciseToBodyPartMap: Record<string, string[]> = {
    'Push-Ups': ['Chest', 'Shoulders', 'Arms'],
    'Bench Press': ['Chest', 'Shoulders', 'Arms'],
    'Squats': ['Legs', 'Core'],
    'Lunges': ['Legs'],
    'Plank': ['Core'],
    'Pull-Ups': ['Back', 'Arms'],
    // Add more mappings as needed
  };
  
  /**
   * Enhanced workout plan adjustment with improved adaptation strategies
   */
  public adjustWorkoutPlan(
    userState: UserState, 
    problematicExercises: Array<{id: string, reason: string, severity: number}>,
    progressionLevel: ProgressionLevel
  ): AdjustmentResult {
    if (!userState.currentPlan) {
      throw new Error("Cannot adjust plan: user has no current workout plan");
    }
    
    const currentPlan = userState.currentPlan;
    
    // Calculate dynamic factor with more advanced logic
    const dynamicFactor = this.calculateDynamicFactor(userState);
    
    // Apply periodization if appropriate
    const periodizationFactor = this.applyPeriodization(userState, progressionLevel);
    
    // Adjust parameters with dynamic factor and periodization
    const newParams = this.adjustParameters(
      userState.adaptiveParams, 
      progressionLevel, 
      dynamicFactor,
      periodizationFactor
    );
    
    // Prepare result object
    const result: AdjustmentResult = {
      parameters: newParams,
      exerciseChanges: [],
      planStructureChanges: [],
      message: this.getProgressionMessage(progressionLevel, userState),
      adjustmentReasons: [] // New field to track adjustment reasons
    };
    
    // 1. Adjust training plan structure for enhanced adaptation
    this.adjustPlanStructure(currentPlan, result, newParams, userState);
    
    // 2. Adjust individual exercises with improved personalization
    const problematicIds = problematicExercises.map(item => item.id);
    this.adjustExercises(
      currentPlan, 
      result, 
      newParams, 
      problematicExercises, 
      userState
    );
    
    // 3. Optimize exercise sequence within each day for better results
    this.optimizeExerciseSequence(currentPlan, result);
    
    // 4. Add rest days or active recovery if appropriate
    this.adjustRestPeriods(currentPlan, result, userState);
    
    // 5. Balance the workout plan across body parts/movement patterns
    this.balanceWorkoutPlan(currentPlan, result, userState);
    
    return result;
  }
  
  /**
   * Calculate dynamic adjustment factor based on comprehensive user state
   * This affects how aggressively we adjust the plan
   */
  private calculateDynamicFactor(userState: UserState): number {
    const feedbackHistory = userState.feedbackHistory;
    if (feedbackHistory.length === 0) return 1; // Default factor if no feedback
    
    // Get recent feedback with recency weighting
    const recentFeedbacks = feedbackHistory.slice(-5);
    let weightedDifficultySum = 0;
    let weightedFatigueSum = 0;
    let weightSum = 0;
    
    for (let i = 0; i < recentFeedbacks.length; i++) {
      const weight = i + 1; // More weight to recent feedback
      weightedDifficultySum += recentFeedbacks[i].difficulty * weight;
      weightedFatigueSum += recentFeedbacks[i].fatigue * weight;
      weightSum += weight;
    }
    
    const avgDifficulty = weightedDifficultySum / weightSum;
    const avgFatigue = weightedFatigueSum / weightSum;
    
    // Base dynamic factor on difficulty vs. optimal difficulty
    let optimalDifficulty = 3.5;
    
    // Adjust optimal difficulty based on experience level
    if (userState.experienceLevel === 'beginner') {
      optimalDifficulty = 3.0;
    } else if (userState.experienceLevel === 'advanced') {
      optimalDifficulty = 4.0;
    }
    
    // Calculate difficulty-based factor (harder than optimal = lower factor)
    const difficultyFactor = 2 - (avgDifficulty / optimalDifficulty);
    
    // Calculate fatigue-based factor (more fatigue = lower factor)
    const fatigueFactor = 1.5 - (avgFatigue / 5) * 0.5;
    
    // Add consistency influence
    const consistencyFactor = userState.metrics.consistencyScore > 0.7 ? 1.1 : 
                             userState.metrics.consistencyScore < 0.4 ? 0.9 : 1.0;
    
    // Combine factors and limit range
    const combinedFactor = difficultyFactor * 0.5 + fatigueFactor * 0.3 + consistencyFactor * 0.2;
    return Math.max(0.7, Math.min(1.3, combinedFactor));
  }
  
  /**
   * Apply periodization to create training cycles
   */
  private applyPeriodization(userState: UserState, progressionLevel: ProgressionLevel): number {
    // Skip periodization for deload or if not enough workout history
    if (progressionLevel === ProgressionLevel.Deload || userState.completedWorkouts < 8) {
      return 1.0;
    }
    
    // Apply wave loading periodization
    // Typical cycle: 3 weeks progressive overload, 1 week deload
    const cycleLength = 4; // 4 week cycle
    const weekInCycle = userState.completedWorkouts % (cycleLength * 7) / 7;
    
    // Calculate periodization factor:
    // Week 1: Moderate (1.0)
    // Week 2: Heavier (1.1)
    // Week 3: Peak (1.2)
    // Week 4: Recovery (0.8)
    let periodFactor;
    
    if (weekInCycle < 1) {
      periodFactor = 1.0; // Moderate/introductory week
    } else if (weekInCycle < 2) {
      periodFactor = 1.1; // Heavier loading
    } else if (weekInCycle < 3) {
      periodFactor = 1.2; // Peak loading
    } else {
      periodFactor = 0.8; // Recovery/deload week
    }
    
    // For advanced users, use more pronounced periodization
    if (userState.experienceLevel === 'advanced') {
      periodFactor = periodFactor * 1.1;
    }
    
    return periodFactor;
  }
  
  /**
   * Enhanced parameter adjustment with periodization and user-specific factors
   */
  private adjustParameters(
    currentParams: AdaptiveParameters, 
    progressionLevel: ProgressionLevel,
    dynamicFactor: number = 1,
    periodizationFactor: number = 1
  ): AdaptiveParameters {
    const newParams = { ...currentParams };
    
    let baseMultiplier = 1;
    let restBaseMultiplier = 1;
    
    // Set base multipliers based on progression level
    switch (progressionLevel) {
      case ProgressionLevel.Deload:
        baseMultiplier = 0.7;
        restBaseMultiplier = 1.3;
        break;
      case ProgressionLevel.Maintenance:
        baseMultiplier = 0.95 + Math.random() * 0.1;
        restBaseMultiplier = 1;
        break;
      case ProgressionLevel.VerySlowProgress:
        baseMultiplier = 1.02;
        restBaseMultiplier = 0.98;
        break;
      case ProgressionLevel.SlowProgress:
        baseMultiplier = 1.05;
        restBaseMultiplier = 0.95;
        break;
      case ProgressionLevel.NormalProgress:
        baseMultiplier = 1.1;
        restBaseMultiplier = 0.9;
        break;
      case ProgressionLevel.ModerateProgress:
        baseMultiplier = 1.12;
        restBaseMultiplier = 0.88;
        break;
      case ProgressionLevel.FastProgress:
        baseMultiplier = 1.15;
        restBaseMultiplier = 0.85;
        break;
      case ProgressionLevel.Breakthrough:
        baseMultiplier = 1.2;
        restBaseMultiplier = 0.8;
        break;
    }
    
    // Apply combined factors (dynamic adjustment and periodization)
    const combinedIntensityFactor = baseMultiplier * dynamicFactor * periodizationFactor;
    const combinedVolumeFactor = baseMultiplier * dynamicFactor * periodizationFactor;
    // Rest periods adjust inversely
    const combinedRestFactor = restBaseMultiplier / (dynamicFactor * periodizationFactor);
    
    // Update parameters
    newParams.intensity *= combinedIntensityFactor;
    newParams.volume *= combinedVolumeFactor;
    newParams.restPeriod *= combinedRestFactor;
    
    // Progressive frequency adjustment
    if (progressionLevel === ProgressionLevel.FastProgress || 
        progressionLevel === ProgressionLevel.Breakthrough) {
      newParams.frequency = Math.min(6, newParams.frequency + 1);
    } else if (progressionLevel === ProgressionLevel.Deload) {
      newParams.frequency = Math.max(2, newParams.frequency - 1);
    }
    
    // Constrain parameters to physiologically reasonable limits
    newParams.intensity = Math.min(1, Math.max(0.3, newParams.intensity));
    newParams.volume = Math.min(1, Math.max(0.3, newParams.volume));
    newParams.restPeriod = Math.min(120, Math.max(15, newParams.restPeriod));
    
    return newParams;
  }
  
  /**
   * Enhanced plan structure adjustment with smarter training splits
   */
  private adjustPlanStructure(
    plan: WorkoutPlan,
    result: AdjustmentResult,
    params: AdaptiveParameters,
    userState: UserState
  ): void {
    const currentDayCount = plan.days.length;
    
    // Check if user is following a strength-specific goal
    const isStrengthFocused = userState.targetGoals.includes('muscle_gain');
    const isEnduranceFocused = userState.targetGoals.includes('endurance');
    
    // Frequency adjustment based on training parameters
    if (Math.abs(currentDayCount - params.frequency) >= 1) {
      if (currentDayCount < params.frequency) {
        // Need to add training day - with smarter focus selection
        const change: PlanStructureChange = {
          type: 'addDay',
          reason: 'Increased training frequency based on your progress and adaptation capacity'
        };
        result.planStructureChanges.push(change);
        result.adjustmentReasons.push('Increased workout frequency to match your improving fitness level');
      } else if (currentDayCount > params.frequency) {
        // Need to reduce training days - with smarter selection of day to remove
        // Find the least effective day to remove
        const dayToRemoveIndex = this.identifyLeastEffectiveDay(plan, userState);
        
        const change: PlanStructureChange = {
          type: 'removeDay',
          dayIndex: dayToRemoveIndex,
          reason: 'Adjusted workout frequency to optimize recovery between sessions'
        };
        result.planStructureChanges.push(change);
        result.adjustmentReasons.push('Reduced workout frequency to enhance recovery quality');
      }
    }
    
    // Adjust workout split based on training focus and experience level
    if (isStrengthFocused && userState.experienceLevel !== 'beginner' && currentDayCount >= 4) {
      // For intermediate and advanced strength trainees, consider body part splits
      this.optimizeTrainingSplit(plan, result, userState);
    }
    
    // Consider fatigue management based on feedback and metrics
    this.adjustForFatigueManagement(plan, result, userState);
  }
  
  /**
   * Identify the least effective day in the plan for potential removal
   */
  private identifyLeastEffectiveDay(plan: WorkoutPlan, userState: UserState): number {
    // Default to last day if no better criteria
    let leastEffectiveIndex = plan.days.length - 1;
    let lowestScore = Infinity;
    
    const feedbackHistory = userState.feedbackHistory;
    if (feedbackHistory.length === 0) return leastEffectiveIndex;
    
    // Calculate effectiveness score for each day
    for (let i = 0; i < plan.days.length; i++) {
      const day = plan.days[i];
      
      // Gather feedback specific to this day's exercises
      const dayFeedbacks = feedbackHistory.filter(feedback => {
        const [dayNumber, _] = feedback.exerciseId.split('-').map(Number);
        return dayNumber === day.dayNumber;
      });
      
      if (dayFeedbacks.length === 0) {
        // If no feedback, this is a candidate for removal
        return i;
      }
      
      // Calculate effectiveness metrics
      const avgEnjoyment = dayFeedbacks.reduce((sum, fb) => sum + fb.enjoyment, 0) / dayFeedbacks.length;
      const avgDifficulty = dayFeedbacks.reduce((sum, fb) => sum + fb.difficulty, 0) / dayFeedbacks.length;
      
      // Calculate effectiveness score - lower is less effective
      // Optimal difficulty is around 3.5, enjoyment matters more
      const difficultyScore = Math.max(0, 1 - Math.abs(avgDifficulty - 3.5) / 2.5);
      const enjoymentScore = avgEnjoyment / 5;
      
      const effectivenessScore = enjoymentScore * 0.7 + difficultyScore * 0.3;
      
      // Update least effective day if this one scores lower
      if (effectivenessScore < lowestScore) {
        lowestScore = effectivenessScore;
        leastEffectiveIndex = i;
      }
    }
    
    return leastEffectiveIndex;
  }
  
  /**
   * Optimize training split based on user goals and experience
   */
  private optimizeTrainingSplit(plan: WorkoutPlan, result: AdjustmentResult, userState: UserState): void {
    const splitTypes = {
      'Push/Pull/Legs': ['Push', 'Pull', 'Legs'],
      'Upper/Lower': ['Upper Body', 'Lower Body'],
      'Full Body': ['Full Body']
    };
    
    let idealSplit: string[];
    
    // Select ideal split based on frequency and goals
    const currentDayCount = plan.days.length;
    const primaryGoal = userState.targetGoals[0];
    
    if (currentDayCount <= 3) {
      // For 2-3 days, full body works best for most people
      idealSplit = splitTypes['Full Body'];
    } else if (currentDayCount === 4) {
      // 4 days works well with upper/lower split
      idealSplit = splitTypes['Upper/Lower'];
    } else {
      // 5+ days can use push/pull/legs or other specialized splits
      idealSplit = splitTypes['Push/Pull/Legs'];
    }
    
    // Check if the current plan follows the ideal split
    const currentFocuses = plan.days.map(day => day.focus);
    const needsSplitOptimization = !this.arraysHaveSameElements(currentFocuses, idealSplit);
    
    if (needsSplitOptimization) {
      // Add change recommendation - we'll implement the actual change in the apply adjustments method
      result.adjustmentReasons.push(`Optimized training split to ${idealSplit.join('/')} for better recovery and progress`);
    }
  }
  
  /**
   * Helper to check if arrays have the same elements (ignoring order and duplicates)
   */
  private arraysHaveSameElements(arr1: string[], arr2: string[]): boolean {
    const set1 = new Set(arr1);
    const set2 = new Set(arr2);
    
    if (set1.size !== set2.size) return false;
    
    for (const item of set1) {
      if (!set2.has(item)) return false;
    }
    
    return true;
  }
  
  /**
   * Adjust plan for fatigue management
   */
  private adjustForFatigueManagement(plan: WorkoutPlan, result: AdjustmentResult, userState: UserState): void {
    // Extract fatigue data
    const feedbackHistory = userState.feedbackHistory;
    if (feedbackHistory.length < 3) return;
    
    const recentFeedbacks = feedbackHistory.slice(-5);
    const avgFatigue = recentFeedbacks.reduce((sum, fb) => sum + fb.fatigue, 0) / recentFeedbacks.length;
    
    // Add recovery day if fatigue is high and no recovery day exists
    if (avgFatigue > 4 && plan.days.length >= 4) {
      const hasActiveRecovery = plan.days.some(day => 
        day.focus.toLowerCase().includes('recovery') || 
        day.focus.toLowerCase().includes('rest')
      );
      
      if (!hasActiveRecovery) {
        const change: PlanStructureChange = {
          type: 'changeRest',
          reason: 'Added active recovery day to manage fatigue levels'
        };
        result.planStructureChanges.push(change);
        result.adjustmentReasons.push('Added recovery day to help manage high fatigue levels');
      }
    }
    
    // For intermediate/advanced users with high training frequency, consider adding deload week
    if (userState.experienceLevel !== 'beginner' && plan.days.length >= 5 && avgFatigue > 4.2) {
      result.adjustmentReasons.push('Recommended periodic deload week every 4-6 weeks to manage accumulated fatigue');
    }
  }
  
  /**
   * Enhanced exercise adjustments with smarter replacement strategy
   */
  private adjustExercises(
    plan: WorkoutPlan,
    result: AdjustmentResult,
    params: AdaptiveParameters,
    problematicExercises: Array<{id: string, reason: string, severity: number}>,
    userState: UserState
  ): void {
    // Convert to simple array of IDs for backward compatibility if needed
    const problematicIds = problematicExercises.map(ex => ex.id);
    
    // Gather data about exercise preferences for better replacements
    const exercisePreferences = this.analyzeExercisePreferences(userState.feedbackHistory);
    
    // Track which body parts are already trained in this plan
    const trainedBodyParts = new Set<string>();
    
    // Iterate through all exercises in the plan
    for (const day of plan.days) {
      // Skip rest days
      if (day.focus.toLowerCase().includes('rest') || day.focus.toLowerCase().includes('recovery')) {
        continue;
      }
      
      for (let i = 0; i < day.exercises.length; i++) {
        const exercise = day.exercises[i];
        const exerciseId = `${day.dayNumber}-${i}`;
        
        // Track body parts trained by this exercise
        const bodyParts = this.exerciseToBodyPartMap[exercise.name];
        if (bodyParts) {
          bodyParts.forEach(part => trainedBodyParts.add(part));
        }
        
        // Find if this exercise is problematic and why
        const problematicInfo = problematicExercises.find(ex => ex.id === exerciseId);
        
        // If exercise is flagged as problematic, find an intelligent replacement
        if (problematicInfo) {
          const newExercise = this.findIntelligentReplacement(
            exercise, 
            day.focus, 
            problematicInfo.reason,
            userState.experienceLevel,
            exercisePreferences
          );
          
          const adjustment: ExerciseAdjustment = {
            exerciseId,
            adjustmentType: 'replace',
            newExercise,
            reason: `Replaced based on your feedback: ${problematicInfo.reason}`
          };
          
          result.exerciseChanges.push(adjustment);
          result.adjustmentReasons.push(`Replaced ${exercise.name} with ${newExercise.name} based on your feedback`);
          continue;
        }
        
        // Progressive overload adjustments based on parameters
        const paramChanges = this.adjustExerciseProgression(
          exercise,
          params,
          userState.experienceLevel
        );
        
        if (Object.keys(paramChanges).length > 0) {
          const adjustment: ExerciseAdjustment = {
            exerciseId,
            adjustmentType: 'modify',
            paramChanges,
            reason: 'Progressive overload adjustment based on your capacity'
          };
          
          result.exerciseChanges.push(adjustment);
        }
      }
    }
    
    // Add variety if user has been using the same plan for a while
    if (userState.completedWorkouts > 20) {
      this.addExerciseVariety(plan, result, userState, exercisePreferences);
    }
  }
  
  /**
   * Find intelligent exercise replacement based on:
   * 1. Exercise similarity
   * 2. User preferences
   * 3. Problem reason (difficulty, enjoyment, pain)
   * 4. User experience level
   */
  private findIntelligentReplacement(
    currentExercise: WorkoutExercise,
    dayFocus: string, 
    problemReason: string,
    experienceLevel: string,
    exercisePreferences: Record<string, number>
  ): WorkoutExercise {
    // Start with similar exercises if available
    let candidateExercises: WorkoutExercise[] = [];
    
    // Get similar exercises from our mapping
    if (this.exerciseSimilarityMap[currentExercise.name]) {
      // Convert names to exercise objects
      candidateExercises = this.exerciseSimilarityMap[currentExercise.name].map(name => {
        return {
          name,
          sets: currentExercise.sets,
          reps: currentExercise.reps,
          duration: currentExercise.duration,
          intensity: currentExercise.intensity,
          restTime: currentExercise.restTime
        };
      });
    }
    
    // If no similar exercises found, get new exercise for this focus
    if (candidateExercises.length === 0) {
      // Get 3 potential replacements to choose from
      for (let i = 0; i < 3; i++) {
        candidateExercises.push(getExerciseForFocus(dayFocus));
      }
    }
    
    // Score each candidate based on problem reason and user preferences
    const scoredCandidates = candidateExercises.map(candidate => {
      let score = 0;
      
      // If user has positive feedback about this exercise, increase score
      if (exercisePreferences[candidate.name] && exercisePreferences[candidate.name] > 3) {
        score += 2;
      }
      
      // If problem was difficulty-related, adjust difficulty
      if (problemReason.includes('difficult')) {
        // Make it slightly easier
        if (candidate.sets) candidate.sets = Math.max(1, candidate.sets - 1);
        if (candidate.reps) candidate.reps = Math.max(5, candidate.reps - 2);
        if (candidate.duration) candidate.duration = Math.max(10, candidate.duration - 15);
        score += 1;
      }
      
      // If problem was pain-related, choose lower impact alternatives
      if (problemReason.includes('pain') || problemReason.includes('discomfort')) {
        // Lower impact exercises should score higher
        if (['Plank', 'Swimming', 'Cycling', 'Elliptical'].includes(candidate.name)) {
          score += 3;
        }
      }
      
      // If problem was enjoyment-related, prioritize engaging exercises
      if (problemReason.includes('enjoyment')) {
        // More dynamic exercises tend to be more engaging
        if (['Box Jumps', 'Battle Ropes', 'Kettlebell Swings', 'Medicine Ball Slams'].includes(candidate.name)) {
          score += 2;
        }
      }
      
      return { exercise: candidate, score };
    });
    
    // Sort by score and pick the best one
    scoredCandidates.sort((a, b) => b.score - a.score);
    
    // Return the highest scored exercise or fallback to first one
    return scoredCandidates[0]?.exercise || getExerciseForFocus(dayFocus);
  }
  
  /**
   * Analyze exercise preferences from feedback history
   */
  private analyzeExercisePreferences(feedbackHistory: UserFeedback[]): Record<string, number> {
    const preferences: Record<string, number> = {};
    
    // Group feedback by exercise
    for (const feedback of feedbackHistory) {
      const [dayNumber, exerciseIndex] = feedback.exerciseId.split('-').map(Number);
      
      // We don't have access to the plan here, so we can't easily map ID to name
      // Using the ID as key instead
      if (!preferences[feedback.exerciseId]) {
        preferences[feedback.exerciseId] = feedback.enjoyment;
      } else {
        // Average with previous feedback
        preferences[feedback.exerciseId] = 
          (preferences[feedback.exerciseId] + feedback.enjoyment) / 2;
      }
    }
    
    return preferences;
  }
  
  /**
   * Advanced progressive overload adjustments based on scientific principles
   */
  private adjustExerciseProgression(
    exercise: WorkoutExercise,
    params: AdaptiveParameters,
    experienceLevel: string
  ): Partial<WorkoutExercise> {
    const changes: Partial<WorkoutExercise> = {};
    
    // Different progression strategies based on experience level
    // Beginners: Emphasize form and consistency, moderate volume increases
    // Intermediate: Balanced progression across all parameters
    // Advanced: Undulating periodization, varied intensity
    
    // Base multipliers that will be used for parameter adjustments
    let setsMultiplier = params.volume;
    let repsMultiplier = params.intensity;
    let durationMultiplier = params.intensity;
    let restTimeMultiplier = 1 / params.intensity; // Inverse relationship
    
    // Apply experience-specific adjustments
    switch (experienceLevel) {
      case 'beginner':
        // Beginners: Focus more on reps, less on sets
        repsMultiplier *= 1.2;
        setsMultiplier *= 0.9;
        break;
      case 'intermediate':
        // Intermediate: Balanced approach
        // Use default multipliers
        break;
      case 'advanced':
        // Advanced: Emphasize intensity, careful with volume
        repsMultiplier *= 1.1;
        setsMultiplier *= 0.95;
        // Shorter rest for advanced users with better recovery
        restTimeMultiplier *= 0.9;
        break;
    }
    
    // Apply set adjustments with more precise calculations
    if (exercise.sets) {
      // Calculate adjusted sets value with rounding to nearest whole number
      const newSets = Math.round(exercise.sets * setsMultiplier / 0.5);
      
      // Only add change if it's different from current
      if (newSets !== exercise.sets) {
        // Keep sets within reasonable physiological limits
        changes.sets = Math.min(Math.max(1, newSets), 
                               experienceLevel === 'advanced' ? 6 : 
                               experienceLevel === 'intermediate' ? 5 : 4);
      }
    }
    
    // Apply rep adjustments
    if (exercise.reps) {
      // Calculate new reps value
      const newReps = Math.round(exercise.reps * repsMultiplier / 0.5);
      
      if (newReps !== exercise.reps) {
        // Different rep ranges based on goals that might be embedded in exercise name
        const isStrengthExercise = exercise.name.includes('Bench') || 
                                  exercise.name.includes('Squat') || 
                                  exercise.name.includes('Deadlift');
        
        const maxReps = isStrengthExercise ? 12 : 20;
        const minReps = isStrengthExercise ? 4 : 8;
        
        changes.reps = Math.min(Math.max(minReps, newReps), maxReps);
      }
    }
    
    // Apply duration adjustments
    if (exercise.duration) {
      // Calculate new duration
      const newDuration = Math.round(exercise.duration * durationMultiplier / 0.5);
      
      if (newDuration !== exercise.duration) {
        changes.duration = Math.min(Math.max(10, newDuration), 
                                  exercise.name.includes('Cardio') ? 60 : 45);
      }
    }
    
    // Apply rest time adjustments
    if (exercise.restTime) {
      // Calculate new rest time
      const newRestTime = Math.round(exercise.restTime * restTimeMultiplier * 0.5);
      
      if (newRestTime !== exercise.restTime) {
        // Different minimum rest times based on exercise type
        const isCompoundExercise = exercise.name.includes('Squat') || 
                                  exercise.name.includes('Deadlift') || 
                                  exercise.name.includes('Bench') ||
                                  exercise.name.includes('Press');
        
        const minRest = isCompoundExercise ? 60 : 30;
        
        changes.restTime = Math.min(Math.max(minRest, newRestTime), 180);
      }
    }
    
    return changes;
  }
  
  /**
   * Add exercise variety for continued progress and engagement
   */
  private addExerciseVariety(
    plan: WorkoutPlan, 
    result: AdjustmentResult, 
    userState: UserState,
    exercisePreferences: Record<string, number>
  ): void {
    // Only introduce variety on a schedule to avoid random changes
    if (userState.completedWorkouts % 10 !== 0) return;
    
    // Identify non-favorite exercises that can be rotated for variety
    const dayToModify = Math.floor(Math.random() * plan.days.length);
    const day = plan.days[dayToModify];
    
    // Skip rest days
    if (day.focus.toLowerCase().includes('rest') || 
        day.focus.toLowerCase().includes('recovery')) {
      return;
    }
    
    // Choose one exercise to replace for variety
    const exerciseIndex = Math.floor(Math.random() * day.exercises.length);
    const exercise = day.exercises[exerciseIndex];
    const exerciseId = `${day.dayNumber}-${exerciseIndex}`;
    
    // Don't replace favorite exercises
    const isHighlyRated = exercisePreferences[exerciseId] && exercisePreferences[exerciseId] > 4;
    if (isHighlyRated) return;
    
    // Find a new exercise that targets the same movement pattern/muscle group
    const newExercise = this.findVarietyReplacement(exercise, day.focus, userState.experienceLevel);
    
    const adjustment: ExerciseAdjustment = {
      exerciseId,
      adjustmentType: 'replace',
      newExercise,
      reason: 'Introducing exercise variety to prevent plateaus and maintain engagement'
    };
    
    result.exerciseChanges.push(adjustment);
    result.adjustmentReasons.push('Added exercise variety to prevent adaptation plateaus');
  }
  
  /**
   * Find a replacement exercise specifically for variety
   */
  private findVarietyReplacement(
    currentExercise: WorkoutExercise,
    dayFocus: string,
    experienceLevel: string
  ): WorkoutExercise {
    // Get 3 potential new exercises
    const candidates: WorkoutExercise[] = [];
    for (let i = 0; i < 3; i++) {
      candidates.push(getExerciseForFocus(dayFocus));
    }
    
    // Filter out the current exercise
    const filteredCandidates = candidates.filter(c => c.name !== currentExercise.name);
    
    // If all candidates were filtered out, get a new one
    if (filteredCandidates.length === 0) {
      const newExercise = getExerciseForFocus(dayFocus);
      
      // Copy progression parameters from the current exercise
      newExercise.sets = currentExercise.sets;
      newExercise.reps = currentExercise.reps;
      newExercise.duration = currentExercise.duration;
      newExercise.restTime = currentExercise.restTime;
      
      return newExercise;
    }
    
    // Pick the first valid candidate and copy progression parameters
    const chosenExercise = filteredCandidates[0];
    chosenExercise.sets = currentExercise.sets;
    chosenExercise.reps = currentExercise.reps;
    chosenExercise.duration = currentExercise.duration;
    chosenExercise.restTime = currentExercise.restTime;
    
    return chosenExercise;
  }
  
  /**
   * Optimize exercise sequence within each workout day
   * - Compound exercises before isolation
   * - Alternating push/pull patterns
   * - Balance upper/lower body work
   */
  private optimizeExerciseSequence(plan: WorkoutPlan, result: AdjustmentResult): void {
    let sequenceOptimized = false;
    
    // Identify compound movements for prioritization
    const compoundExercises = [
      'Squat', 'Deadlift', 'Bench Press', 'Overhead Press', 'Barbell Row',
      'Pull-Up', 'Push-Up', 'Lunge', 'Clean', 'Snatch', 'Dip'
    ];
    
    // Process each day
    for (const day of plan.days) {
      // Skip rest days
      if (day.focus.toLowerCase().includes('rest') || 
          day.focus.toLowerCase().includes('recovery')) {
        continue;
      }
      
      // Clone exercises array to check if we need to reorder
      const originalOrder = [...day.exercises];
      const optimizedOrder: WorkoutExercise[] = [];
      
      // First, identify and prioritize compound exercises
      const compoundsList: WorkoutExercise[] = [];
      const isolationList: WorkoutExercise[] = [];
      const cardioList: WorkoutExercise[] = [];
      
      // Categorize exercises
      for (const exercise of day.exercises) {
        if (compoundExercises.some(name => exercise.name.includes(name))) {
          compoundsList.push(exercise);
        } else if (exercise.name.toLowerCase().includes('cardio') || 
                 exercise.name.toLowerCase().includes('run') ||
                 exercise.name.toLowerCase().includes('cycling') ||
                 exercise.name.toLowerCase().includes('elliptical')) {
          cardioList.push(exercise);
        } else {
          isolationList.push(exercise);
        }
      }
      
      // Build the optimized exercise order
      // Start with compounds
      optimizedOrder.push(...compoundsList);
      
      // Then isolation
      optimizedOrder.push(...isolationList);
      
      // End with cardio
      optimizedOrder.push(...cardioList);
      
      // Check if order has changed
      let orderChanged = false;
      if (optimizedOrder.length === originalOrder.length) {
        for (let i = 0; i < optimizedOrder.length; i++) {
          if (optimizedOrder[i].name !== originalOrder[i].name) {
            orderChanged = true;
            break;
          }
        }
      }
      
      // Update day.exercises if order changed
      if (orderChanged) {
        // We'll use exerciseChanges to record this
        for (let i = 0; i < day.exercises.length; i++) {
          if (i < optimizedOrder.length && day.exercises[i].name !== optimizedOrder[i].name) {
            const exerciseId = `${day.dayNumber}-${i}`;
            
            // Create an exercise adjustment
            const adjustment: ExerciseAdjustment = {
              exerciseId,
              adjustmentType: 'replace',
              newExercise: optimizedOrder[i],
              reason: 'Optimized exercise sequence for better workout efficiency'
            };
            
            result.exerciseChanges.push(adjustment);
            sequenceOptimized = true;
          }
        }
      }
    }
    
    // Add overall explanation if sequence was optimized
    if (sequenceOptimized) {
      result.adjustmentReasons.push('Optimized exercise sequence to prioritize compound movements before isolation exercises');
    }
  }
  
  /**
   * Balance workout plan across body parts and movement patterns
   * Ensures all major muscle groups are trained with appropriate frequency
   */
  private balanceWorkoutPlan(plan: WorkoutPlan, result: AdjustmentResult, userState: UserState): void {
    // Skip if plan has fewer than 3 days
    if (plan.days.length < 3) return;
    
    // Track which body parts are trained and their frequency
    const bodyPartFrequency: Record<string, number> = {
      'Chest': 0,
      'Back': 0,
      'Legs': 0,
      'Shoulders': 0,
      'Arms': 0,
      'Core': 0,
      'Cardio': 0
    };
    
    // Track which movement patterns are trained
    const movementPatternFrequency: Record<string, number> = {
      'Push': 0,
      'Pull': 0,
      'Hinge': 0,
      'Squat': 0,
      'Carry': 0,
      'Rotation': 0
    };
    
    // Analyze current plan balance
    for (const day of plan.days) {
      // Skip rest days
      if (day.focus.toLowerCase().includes('rest') || 
          day.focus.toLowerCase().includes('recovery')) {
        continue;
      }
      
      // Record focus area
      if (day.focus.includes('Upper')) {
        bodyPartFrequency['Chest']++;
        bodyPartFrequency['Back']++;
        bodyPartFrequency['Shoulders']++;
        bodyPartFrequency['Arms']++;
      } else if (day.focus.includes('Lower')) {
        bodyPartFrequency['Legs']++;
      } else if (day.focus.includes('Push')) {
        bodyPartFrequency['Chest']++;
        bodyPartFrequency['Shoulders']++;
        bodyPartFrequency['Arms']++;
        movementPatternFrequency['Push']++;
      } else if (day.focus.includes('Pull')) {
        bodyPartFrequency['Back']++;
        bodyPartFrequency['Arms']++;
        movementPatternFrequency['Pull']++;
      } else if (day.focus.includes('Legs')) {
        bodyPartFrequency['Legs']++;
        movementPatternFrequency['Squat']++;
        movementPatternFrequency['Hinge']++;
      } else if (day.focus.includes('Core')) {
        bodyPartFrequency['Core']++;
        movementPatternFrequency['Rotation']++;
      } else if (day.focus.includes('Cardio')) {
        bodyPartFrequency['Cardio']++;
      } else if (day.focus.includes('Full Body')) {
        // Full body days hit everything to some degree
        Object.keys(bodyPartFrequency).forEach(part => bodyPartFrequency[part]++);
        Object.keys(movementPatternFrequency).forEach(pattern => movementPatternFrequency[pattern]++);
      }
      
      // Analyze individual exercises for more detailed frequency
      for (const exercise of day.exercises) {
        // Map exercise to body parts
        const bodyParts = this.mapExerciseToBodyParts(exercise.name);
        bodyParts.forEach(part => bodyPartFrequency[part]++);
        
        // Map exercise to movement patterns
        const patterns = this.mapExerciseToMovementPatterns(exercise.name);
        patterns.forEach(pattern => movementPatternFrequency[pattern]++);
      }
    }
    
    // Check balance issues
    const imbalances = this.identifyImbalances(bodyPartFrequency, movementPatternFrequency);
    
    // Address imbalances if significant
    if (imbalances.length > 0) {
      // Add a reason for the adjustment
      result.adjustmentReasons.push(`Balanced workout plan to address: ${imbalances.join(', ')}`);
      
      // Find a suitable day to modify
      let dayToModifyIndex = -1;
      for (let i = 0; i < plan.days.length; i++) {
        const day = plan.days[i];
        // Look for a non-rest day that doesn't already focus on the imbalanced area
        if (!day.focus.toLowerCase().includes('rest') && 
            !day.focus.toLowerCase().includes('recovery')) {
          
          // Check if this day doesn't already address the first imbalance
          if (!imbalances.some(imbalance => day.focus.includes(imbalance))) {
            dayToModifyIndex = i;
            break;
          }
        }
      }
      
      // If we found a day to modify
      if (dayToModifyIndex >= 0) {
        const dayToModify = plan.days[dayToModifyIndex];
        
        // Modify the last exercise to address the imbalance
        if (dayToModify.exercises.length > 0) {
          const exerciseToReplaceIndex = dayToModify.exercises.length - 1;
          const exerciseId = `${dayToModify.dayNumber}-${exerciseToReplaceIndex}`;
          
          // Get a new exercise focused on the imbalanced area
          const newExercise = this.getExerciseForImbalance(imbalances[0]);
          
          const adjustment: ExerciseAdjustment = {
            exerciseId,
            adjustmentType: 'replace',
            newExercise,
            reason: `Added to address balance needs for ${imbalances[0]}`
          };
          
          result.exerciseChanges.push(adjustment);
        }
      }
    }
  }
  
  /**
   * Map exercise name to primary body parts trained
   */
  private mapExerciseToBodyParts(exerciseName: string): string[] {
    const name = exerciseName.toLowerCase();
    
    if (this.exerciseToBodyPartMap[exerciseName]) {
      return this.exerciseToBodyPartMap[exerciseName];
    }
    
    // Default mapping based on exercise name keywords
    if (name.includes('bench') || name.includes('push-up') || name.includes('chest') || name.includes('fly')) {
      return ['Chest', 'Arms'];
    } 
    else if (name.includes('row') || name.includes('pull-up') || name.includes('lat') || name.includes('back')) {
      return ['Back', 'Arms'];
    }
    else if (name.includes('squat') || name.includes('lunge') || name.includes('leg') || name.includes('calf')) {
      return ['Legs'];
    }
    else if (name.includes('shoulder') || name.includes('press') || name.includes('raise') || name.includes('delt')) {
      return ['Shoulders'];
    }
    else if (name.includes('curl') || name.includes('extension') || name.includes('tricep') || name.includes('bicep')) {
      return ['Arms'];
    }
    else if (name.includes('crunch') || name.includes('sit-up') || name.includes('plank') || name.includes('ab')) {
      return ['Core'];
    }
    else if (name.includes('run') || name.includes('cardio') || name.includes('bike') || name.includes('elliptical')) {
      return ['Cardio'];
    }
    
    // Default to full body if no match
    return ['Full Body'];
  }
  
  /**
   * Map exercise name to movement patterns
   */
  private mapExerciseToMovementPatterns(exerciseName: string): string[] {
    const name = exerciseName.toLowerCase();
    
    if (name.includes('bench') || name.includes('push') || name.includes('press') || name.includes('fly')) {
      return ['Push'];
    }
    else if (name.includes('row') || name.includes('pull') || name.includes('curl')) {
      return ['Pull'];
    }
    else if (name.includes('deadlift') || name.includes('good morning') || name.includes('swing')) {
      return ['Hinge'];
    }
    else if (name.includes('squat') || name.includes('lunge')) {
      return ['Squat'];
    }
    else if (name.includes('carry') || name.includes('farmer')) {
      return ['Carry'];
    }
    else if (name.includes('twist') || name.includes('rotation') || name.includes('russian')) {
      return ['Rotation'];
    }
    
    // Default to empty array if no match
    return [];
  }
  
  /**
   * Identify muscle/movement imbalances in the plan
   */
  private identifyImbalances(
    bodyPartFrequency: Record<string, number>,
    movementPatternFrequency: Record<string, number>
  ): string[] {
    const imbalances: string[] = [];
    
    // Check if any body part has significantly lower frequency
    const bodyPartEntries = Object.entries(bodyPartFrequency);
    const avgBodyPartFrequency = bodyPartEntries.reduce((sum, [_, freq]) => sum + freq, 0) / bodyPartEntries.length;
    
    for (const [part, freq] of bodyPartEntries) {
      // Ignore cardio in the main balance check
      if (part === 'Cardio') continue;
      
      // If a body part is trained less than half the average
      if (freq < avgBodyPartFrequency * 0.5 && freq < 2) {
        imbalances.push(part);
      }
    }
    
    // Check push/pull balance
    const pushFreq = movementPatternFrequency['Push'] || 0;
    const pullFreq = movementPatternFrequency['Pull'] || 0;
    
    if (Math.abs(pushFreq - pullFreq) > 2) {
      // Significant push/pull imbalance
      if (pushFreq > pullFreq) {
        imbalances.push('Pull (Push/Pull balance)');
      } else {
        imbalances.push('Push (Push/Pull balance)');
      }
    }
    
    return imbalances;
  }
  
  /**
   * Get exercise to address a specific imbalance
   */
  private getExerciseForImbalance(imbalance: string): WorkoutExercise {
    // Extract the focus area from the imbalance string
    const focus = imbalance.split(' ')[0]; // Get just the first word
    
    // Get an appropriate exercise
    const exercise = getExerciseForFocus(focus);
    
    // Make sure it's reasonable for balancing purposes (not too intense)
    if (exercise.sets && exercise.sets > 3) {
      exercise.sets = 3;
    }
    
    if (exercise.reps && exercise.reps > 12) {
      exercise.reps = 12;
    }
    
    if (exercise.duration && exercise.duration > 45) {
      exercise.duration = 45;
    }
    
    return exercise;
  }
  
  /**
   * Generate appropriate progression message based on the progression level and user state
   */
  private getProgressionMessage(progressionLevel: ProgressionLevel, userState: UserState): string {
    const experienceLevel = userState.experienceLevel;
    const completedWorkouts = userState.completedWorkouts;
    
    // Different messaging based on experience level
    let experiencePrefix = '';
    if (completedWorkouts > 20) {
      // More personalized message for consistent users
      if (experienceLevel === 'beginner') {
        experiencePrefix = "You're making steady progress as a beginner. ";
      } else if (experienceLevel === 'intermediate') {
        experiencePrefix = "Your consistent training is paying off. ";
      } else if (experienceLevel === 'advanced') {
        experiencePrefix = "As an experienced athlete, your plan needs careful optimization. ";
      }
    }
    
    // Main message based on progression level
    let mainMessage = '';
    switch (progressionLevel) {
      case ProgressionLevel.Deload:
        mainMessage = "We've added a strategic deload week to help your muscles and nervous system recover fully. This is an important part of long-term progress.";
        break;
      case ProgressionLevel.Maintenance:
        mainMessage = "Your current workout level is still appropriate. We've maintained the basic structure while adding some variation to prevent plateaus.";
        break;
      case ProgressionLevel.VerySlowProgress:
        mainMessage = "We've made subtle adjustments to your workout plan. Slow, steady progress is often more sustainable in the long run.";
        break;
      case ProgressionLevel.SlowProgress:
        mainMessage = "Based on your feedback and progress, we've slightly increased the training difficulty to ensure continued improvement.";
        break;
      case ProgressionLevel.NormalProgress:
        mainMessage = "Your performance shows you're ready for new challenges. We've adjusted the plan to ensure you keep progressing at a healthy rate.";
        break;
      case ProgressionLevel.ModerateProgress:
        mainMessage = "Great progress! We've moderately increased the challenge in your workouts to match your improving fitness level.";
        break;
      case ProgressionLevel.FastProgress:
        mainMessage = "You're progressing exceptionally well! We've significantly increased the workout intensity to match your capabilities.";
        break;
      case ProgressionLevel.Breakthrough:
        mainMessage = "Impressive! Your outstanding performance shows you're ready for a substantial training advancement. We've optimized your plan accordingly.";
        break;
      default:
        mainMessage = "Your workout plan has been adjusted based on your progress and feedback.";
    }
    
    // Add personalized focus area if available
    let focusMessage = '';
    if (userState.targetGoals.length > 0) {
      const primaryGoal = userState.targetGoals[0];
      if (primaryGoal === 'muscle_gain') {
        focusMessage = " This adjusted plan emphasizes progressive overload for optimal muscle development.";
      } else if (primaryGoal === 'fat_loss') {
        focusMessage = " We've balanced intensity and volume to maximize calorie burn while maintaining muscle.";
      } else if (primaryGoal === 'endurance') {
        focusMessage = " The adjustments focus on building your cardiovascular capacity and muscular endurance.";
      } else if (primaryGoal === 'general_health') {
        focusMessage = " These balanced adjustments support overall fitness and well-being.";
      }
    }
    
    return experiencePrefix + mainMessage + focusMessage;
  }
  /**
 * Adjust rest periods between training days to optimize recovery
 */
private adjustRestPeriods(plan: WorkoutPlan, result: AdjustmentResult, userState: UserState): void {
  // Skip if plan has fewer than 3 days
  if (plan.days.length < 3) return;
  
  // Extract fatigue data
  const feedbackHistory = userState.feedbackHistory;
  if (feedbackHistory.length < 3) return;
  
  const recentFeedbacks = feedbackHistory.slice(-5);
  const avgFatigue = recentFeedbacks.reduce((sum, fb) => sum + fb.fatigue, 0) / recentFeedbacks.length;
  
  // Check if we need additional rest days based on fatigue
  const needsMoreRest = avgFatigue > 3.8;
  
  // Check current rest day distribution
  const restDayIndices: number[] = [];
  
  // Find all rest days
  plan.days.forEach((day, index) => {
    if (day.focus.toLowerCase().includes('rest') || 
        day.focus.toLowerCase().includes('recovery')) {
      restDayIndices.push(index);
    }
  });
  
  // If no rest days and fatigue is high, convert a day to active recovery
  if (restDayIndices.length === 0 && needsMoreRest) {
    // Find the best day to convert to a rest day (typically middle of the week)
    const middleIndex = Math.floor(plan.days.length / 2);
    
    const change: PlanStructureChange = {
      type: 'changeRest',
      reason: 'Added recovery day to optimize training frequency and recovery'
    };
    
    result.planStructureChanges.push(change);
    result.adjustmentReasons.push('Added strategic rest day to improve recovery and performance');
    return;
  }
  
  // Check if consecutive training days are too many (more than 3 days in a row)
  let consecutiveTrainingDays = 0;
  let longestStretch = 0;
  
  // Find longest stretch of consecutive training days
  for (let i = 0; i < plan.days.length; i++) {
    const day = plan.days[i];
    if (!day.focus.toLowerCase().includes('rest') && !day.focus.toLowerCase().includes('recovery')) {
      consecutiveTrainingDays++;
      longestStretch = Math.max(longestStretch, consecutiveTrainingDays);
    } else {
      consecutiveTrainingDays = 0;
    }
  }
  
  // If too many consecutive days and fatigue is high, recommend rest day
  if (longestStretch > 3 && avgFatigue > 3.5) {
    // Find the middle of the longest training stretch and add rest day there
    result.adjustmentReasons.push('Recommended adding a rest day to break up long stretches of consecutive training');
  }
}
}