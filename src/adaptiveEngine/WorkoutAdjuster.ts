import { 
    UserState, 
    AdjustmentResult, 
    ExerciseAdjustment, 
    PlanStructureChange,
    ProgressionLevel,
    AdaptiveParameters
  } from './types';
  import { WorkoutPlan, WorkoutExercise, WorkoutDay } from '@/types/user';
  import { getExerciseForFocus } from '@/utils/workoutGenerator';
  
  export class WorkoutAdjuster {
    /**
     * Adjust workout plan based on user state and progression level
     */
    public adjustWorkoutPlan(
      userState: UserState, 
      problematicExercises: string[],
      progressionLevel: ProgressionLevel
    ): AdjustmentResult {
      // Can't adjust without a current plan
      if (!userState.currentPlan) {
        throw new Error("Cannot adjust plan: user has no current workout plan");
      }
      
      const currentPlan = userState.currentPlan;
      const newParams = this.adjustParameters(userState.adaptiveParams, progressionLevel);
      
      // Prepare result object
      const result: AdjustmentResult = {
        parameters: newParams,
        exerciseChanges: [],
        planStructureChanges: [],
        message: this.getProgressionMessage(progressionLevel)
      };
      
      // 1. Adjust plan structure
      this.adjustPlanStructure(currentPlan, result, newParams, userState);
      
      // 2. Adjust individual exercises
      this.adjustExercises(
        currentPlan, 
        result, 
        newParams, 
        problematicExercises, 
        userState.experienceLevel
      );
      
      return result;
    }
    
    /**
     * Adjust training parameters based on progression level
     */
    private adjustParameters(
      currentParams: AdaptiveParameters, 
      progressionLevel: ProgressionLevel
    ): AdaptiveParameters {
      const newParams = { ...currentParams };
      
      // Adjust parameters based on progression level
      switch (progressionLevel) {
        case ProgressionLevel.Deload:
          // Deload: lower intensity and volume, increase rest
          newParams.intensity *= 0.7;
          newParams.volume *= 0.7;
          newParams.restPeriod *= 1.3;
          break;
          
        case ProgressionLevel.Maintenance:
          // Maintenance: parameters mostly unchanged, slight variation to prevent adaptation
          newParams.intensity *= 0.95 + Math.random() * 0.1; // Small fluctuation
          newParams.volume *= 0.95 + Math.random() * 0.1;
          break;
          
        case ProgressionLevel.SlowProgress:
          // Slow progress: minor increase in parameters
          newParams.intensity *= 1.05;
          newParams.volume *= 1.05;
          newParams.restPeriod *= 0.95;
          break;
          
        case ProgressionLevel.NormalProgress:
          // Normal progress: moderate increase in parameters
          newParams.intensity *= 1.1;
          newParams.volume *= 1.1;
          newParams.restPeriod *= 0.9;
          break;
          
        case ProgressionLevel.FastProgress:
          // Fast progress: significant increase in parameters
          newParams.intensity *= 1.15;
          newParams.volume *= 1.15;
          newParams.restPeriod *= 0.85;
          break;
          
        case ProgressionLevel.Breakthrough:
          // Breakthrough progress: major increase in parameters
          newParams.intensity *= 1.2;
          newParams.volume *= 1.2;
          newParams.restPeriod *= 0.8;
          break;
      }
      
      // Ensure parameters are within reasonable bounds
      newParams.intensity = Math.min(1, Math.max(0.3, newParams.intensity));
      newParams.volume = Math.min(1, Math.max(0.3, newParams.volume));
      newParams.restPeriod = Math.min(120, Math.max(15, newParams.restPeriod));
      
      return newParams;
    }
    
    /**
     * Adjust plan structure (days, rest periods)
     */
    private adjustPlanStructure(
      plan: WorkoutPlan,
      result: AdjustmentResult,
      params: AdaptiveParameters,
      userState: UserState
    ): void {
      const currentDayCount = plan.days.length;
      
      // If parameter frequency doesn't match current plan days, consider adjusting
      if (Math.abs(currentDayCount - params.frequency) >= 1) {
        if (currentDayCount < params.frequency) {
          // Need to add training day
          const change: PlanStructureChange = {
            type: 'addDay',
            reason: 'Based on your progress and consistency, we increased the training frequency'
          };
          result.planStructureChanges.push(change);
        } else if (currentDayCount > params.frequency) {
          // Need to reduce training days
          const change: PlanStructureChange = {
            type: 'removeDay',
            dayIndex: currentDayCount - 1,
            reason: 'Adjusted workout frequency to improve recovery quality'
          };
          result.planStructureChanges.push(change);
        }
      }
      
      // Consider adding or adjusting rest days
      const hasExplicitRestDay = plan.days.some(day => 
        day.focus.toLowerCase().includes('rest')
      );
      
      if (!hasExplicitRestDay && currentDayCount >= 4) {
        // Multiple training days but no explicit rest, suggest adding one
        const change: PlanStructureChange = {
          type: 'changeRest',
          reason: 'Added explicit recovery day to optimize training effect'
        };
        result.planStructureChanges.push(change);
      }
    }
    
    /**
     * Adjust individual exercises
     */
    private adjustExercises(
      plan: WorkoutPlan,
      result: AdjustmentResult,
      params: AdaptiveParameters,
      problematicExercises: string[],
      experienceLevel: string
    ): void {
      // Iterate through all exercises in the plan
      for (const day of plan.days) {
        for (let i = 0; i < day.exercises.length; i++) {
          const exercise = day.exercises[i];
          const exerciseId = `${day.dayNumber}-${i}`;
          
          // If exercise is flagged as problematic, consider replacing
          if (problematicExercises.includes(exerciseId)) {
            const adjustment: ExerciseAdjustment = {
              exerciseId,
              adjustmentType: 'replace',
              newExercise: this.getReplacementExercise(day.focus, experienceLevel),
              reason: 'Based on your feedback, we replaced this with a similar but more suitable exercise'
            };
            result.exerciseChanges.push(adjustment);
            continue;
          }
          
          // Adjust exercise parameters
          const paramChanges = this.adjustExerciseParams(exercise, params);
          if (Object.keys(paramChanges).length > 0) {
            const adjustment: ExerciseAdjustment = {
              exerciseId,
              adjustmentType: 'modify',
              paramChanges,
              reason: 'Adjusted exercise intensity to match your progress'
            };
            result.exerciseChanges.push(adjustment);
          }
        }
      }
    }
    
    /**
     * Adjust parameters for a single exercise
     */
    private adjustExerciseParams(
      exercise: WorkoutExercise, 
      params: AdaptiveParameters
    ): Partial<WorkoutExercise> {
      const changes: Partial<WorkoutExercise> = {};
      
      // Adjust exercise based on intensity and volume parameters
      if (exercise.sets) {
        // Adjust sets
        const volumeAdjustment = Math.round(exercise.sets * params.volume / 0.5);
        if (volumeAdjustment !== exercise.sets) {
          changes.sets = Math.max(1, volumeAdjustment);
        }
      }
      
      if (exercise.reps) {
        // Adjust reps
        const repAdjustment = Math.round(exercise.reps * params.intensity / 0.5);
        if (repAdjustment !== exercise.reps) {
          changes.reps = Math.max(1, repAdjustment);
        }
      }
      
      if (exercise.duration) {
        // Adjust duration
        const durationAdjustment = Math.round(exercise.duration * params.intensity / 0.5);
        if (durationAdjustment !== exercise.duration) {
          changes.duration = Math.max(10, durationAdjustment);
        }
      }
      
      if (exercise.restTime) {
        // Adjust rest time
        const restAdjustment = Math.round(exercise.restTime * (1 / params.intensity) * 0.5);
        if (restAdjustment !== exercise.restTime) {
          changes.restTime = Math.max(10, restAdjustment);
        }
      }
      
      // Can add other parameter adjustments
      
      return changes;
    }
    
    /**
     * Generate a replacement exercise
     */
    private getReplacementExercise(focus: string, experienceLevel: string): WorkoutExercise {
      // Use existing exercise generator function to get a replacement
      return getExerciseForFocus(focus);
    }
    
    /**
     * Generate progression message
     */
    private getProgressionMessage(progressionLevel: ProgressionLevel): string {
      switch (progressionLevel) {
        case ProgressionLevel.Deload:
          return "To optimize your long-term progress, we've added a deload week to help your muscles and nervous system recover.";
        case ProgressionLevel.Maintenance:
          return "Your current workout plan is still appropriate for your level. We've maintained the basic difficulty while adding some variation to prevent plateaus.";
        case ProgressionLevel.SlowProgress:
          return "Based on your feedback and progress, we've slightly increased the training difficulty to keep steady progress.";
        case ProgressionLevel.NormalProgress:
          return "Your performance shows you're ready for new challenges. We've adjusted the training intensity to ensure continued progress.";
        case ProgressionLevel.FastProgress:
          return "Your progress is excellent! We've increased the difficulty accordingly to help you continue pushing your limits.";
        case ProgressionLevel.Breakthrough:
          return "Impressive! Based on your outstanding performance, we've significantly increased the training difficulty to help you achieve breakthrough progress.";
        default:
          return "Your workout plan has been adjusted based on your progress and feedback.";
      }
    }
  }