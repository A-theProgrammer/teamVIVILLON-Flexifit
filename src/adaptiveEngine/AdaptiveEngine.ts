import { UserProfiler } from './UserProfiler'
import { FeedbackAnalyzer } from './FeedbackAnalyzer';
import { WorkoutAdjuster } from './WorkoutAdjuster';
import { UserState, AdjustmentResult } from './types';
import { WorkoutPlan, UserModel, WorkoutDay, WorkoutExercise } from '../types/user';
import { getExerciseForFocus } from '../utils/workoutGenerator';

export class AdaptiveEngine {
  private userProfiler: UserProfiler;
  private feedbackAnalyzer: FeedbackAnalyzer;
  private workoutAdjuster: WorkoutAdjuster;
  
  constructor() {
    this.userProfiler = new UserProfiler();
    this.feedbackAnalyzer = new FeedbackAnalyzer();
    this.workoutAdjuster = new WorkoutAdjuster();
  }
  

  public generateAdaptiveWorkoutPlan(
    user: UserModel, 
    currentPlan: WorkoutPlan | null, 
    feedbackHistory: any[]
  ): WorkoutPlan {
    const userState = this.userProfiler.createUserState(user, currentPlan, feedbackHistory);
    const progressionLevel = this.feedbackAnalyzer.analyzeUserProgression(userState);
    const problematicExercises = this.feedbackAnalyzer.identifyProblematicExercises(feedbackHistory);
    
    const adjustmentResult = this.workoutAdjuster.adjustWorkoutPlan(
      userState,
      problematicExercises,
      progressionLevel
    );
    
    const adjustedPlan = this.applyAdjustments(currentPlan!, adjustmentResult);
    
    return adjustedPlan;
  }
  
  private applyAdjustments(plan: WorkoutPlan, adjustments: AdjustmentResult): WorkoutPlan {
    // Create a deep copy of the plan to avoid mutating the original plan
    const newPlan: WorkoutPlan = {
      ...plan,
      days: JSON.parse(JSON.stringify(plan.days)), // Deep copy of the days array
      description: `${plan.description} (Adaptively Adjusted)`
    };
  
    // ---------------------------
    // Apply exercise adjustments (modify or replace individual exercises)
    for (const change of adjustments.exerciseChanges) {
      const [dayNumber, exerciseIndex] = change.exerciseId.split('-').map(Number);
      const dayIndex = newPlan.days.findIndex(d => d.dayNumber === dayNumber);
  
      if (dayIndex === -1 || exerciseIndex >= newPlan.days[dayIndex].exercises.length) {
        continue; // Skip if the specified day or exercise is not found
      }
  
      if (change.adjustmentType === 'replace' && change.newExercise) {
        // Replace the existing exercise entirely with a new exercise
        newPlan.days[dayIndex].exercises[exerciseIndex] = change.newExercise;
      } else if (change.adjustmentType === 'modify' && change.paramChanges) {
        // Modify specific parameters (e.g., sets, reps, duration) of the exercise
        newPlan.days[dayIndex].exercises[exerciseIndex] = {
          ...newPlan.days[dayIndex].exercises[exerciseIndex],
          ...change.paramChanges
        };
      }
    }
    // ---------------------------
    
    // ---------------------------
    // Apply plan structure adjustments (adding, removing days, or adjusting rest days)
    for (const change of adjustments.planStructureChanges) {
      if (change.type === 'addDay' && newPlan.days.length < 7) {
        // Determine the new day number by incrementing the last day's number
        const lastDay = newPlan.days[newPlan.days.length - 1];
        const newDayNumber = lastDay.dayNumber + 1;
        
        // --- Optimized Focus Selection Logic Start ---
        // Collect statistics for existing training days based on their focus.
        // We calculate the training load (sum of sets * reps or duration) for each day
        // and count how many days use each focus.
        interface FocusStats {
          count: number;
          totalLoad: number;
        }
        const focusStats: Record<string, FocusStats> = {};
        
        newPlan.days.forEach(day => {
          let dayLoad = 0;
          day.exercises.forEach(ex => {
            if (ex.sets && ex.reps) {
              dayLoad += ex.sets * ex.reps;
            } else if (ex.duration) {
              dayLoad += ex.duration; // Adjust for duration-based exercises as needed
            }
          });
          if (!focusStats[day.focus]) {
            focusStats[day.focus] = { count: 0, totalLoad: 0 };
          }
          focusStats[day.focus].count += 1;
          focusStats[day.focus].totalLoad += dayLoad;
        });
        
        // Define a list of possible training focuses
        const possibleFocuses = ['Upper Body', 'Lower Body', 'Core', 'Cardio', 'Full Body'];
        
        // Step 1: Choose a focus that hasn't been used yet (if available)
        let newFocus: string | undefined = possibleFocuses.find(focus => !focusStats[focus]);
        
        // Step 2: If all focuses are used, choose the one with the lowest combined score.
        // The score is defined as: score = count + λ * (totalLoad / count)
        // A lower score indicates that focus area has been trained less frequently or with lower load.
        if (!newFocus) {
          const lambda = 0.01; // Weight factor to balance count and average load
          let bestScore = Infinity;
          for (const focus of possibleFocuses) {
            const stats = focusStats[focus];
            const averageLoad = stats.totalLoad / stats.count;
            const score = stats.count + lambda * averageLoad;
            if (score < bestScore) {
              bestScore = score;
              newFocus = focus;
            }
          }
        }
        
        // Fallback to a default focus if none is selected
        if (!newFocus) {
          newFocus = 'Full Body';
        }
        // --- Optimized Focus Selection Logic End ---
        
        // Generate a new training day using the selected focus.
        // Instead of creating a default exercise locally, call getExerciseForFocus from the workoutGenerator module.
        const newDay: WorkoutDay = {
          dayNumber: newDayNumber,
          focus: newFocus,
          exercises: Array(3)
            .fill(0)
            .map(() => getExerciseForFocus(newFocus || 'Full Body')) // Reuse centralized exercise generation logic
        };
        
        newPlan.days.push(newDay);
      } else if (change.type === 'removeDay' && typeof change.dayIndex === 'number') {
        // Remove the training day at the specified index
        newPlan.days.splice(change.dayIndex, 1);
      } else if (change.type === 'changeRest') {
        // Adjust an existing day to convert it into an active recovery/rest day
        const restDayIndex = newPlan.days.findIndex(day =>
          !day.focus.toLowerCase().includes('rest')
        );
        if (restDayIndex !== -1) {
          newPlan.days[restDayIndex].focus = 'Active Recovery';
          newPlan.days[restDayIndex].exercises = [
            {
              name: 'Light Walking or Stretching',
              duration: 20,
              intensity: 'Low',
              notes: 'Stay active but allow your body to recover'
            },
            {
              name: 'Foam Rolling',
              duration: 10,
              intensity: 'Low',
              notes: 'Focus on tight areas'
            },
            {
              name: 'Mobility Work',
              duration: 15,
              intensity: 'Low',
              notes: 'Improve joint range of motion'
            }
          ];
        }
      }
    }
    // ---------------------------
    
    // Update plan metadata to reflect that adjustments have been applied
    if (!newPlan.name.includes('(Adjusted)')) {
      newPlan.name = `${newPlan.name} (Adjusted)`;
    }
    newPlan.createdAt = new Date().toISOString();
    
    return newPlan;
  }
  
  
}