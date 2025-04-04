import { UserProfiler } from './UserProfiler'
import { FeedbackAnalyzer } from './FeedbackAnalyzer';
import { WorkoutAdjuster } from './WorkoutAdjuster';
import { UserState, AdjustmentResult } from './types';
import { WorkoutPlan, UserModel, WorkoutDay } from '@/types/user';

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
    // Create copy of plan
    const newPlan: WorkoutPlan = {
      ...plan,
      days: JSON.parse(JSON.stringify(plan.days)), // Deep copy
      description: `${plan.description} (Adaptively Adjusted)`
    };
    
    // Apply exercise adjustments
    for (const change of adjustments.exerciseChanges) {
      const [dayNumber, exerciseIndex] = change.exerciseId.split('-').map(Number);
      const dayIndex = newPlan.days.findIndex(d => d.dayNumber === dayNumber);
      
      if (dayIndex === -1 || exerciseIndex >= newPlan.days[dayIndex].exercises.length) {
        continue; // Skip invalid adjustments
      }
      
      if (change.adjustmentType === 'replace' && change.newExercise) {
        // Replace exercise
        newPlan.days[dayIndex].exercises[exerciseIndex] = change.newExercise;
      } else if (change.adjustmentType === 'modify' && change.paramChanges) {
        // Modify parameters
        newPlan.days[dayIndex].exercises[exerciseIndex] = {
          ...newPlan.days[dayIndex].exercises[exerciseIndex],
          ...change.paramChanges
        };
      }
    }
    
    for (const change of adjustments.planStructureChanges) {
      if (change.type === 'addDay' && newPlan.days.length < 7) {
        // Add new training day
        const lastDay = newPlan.days[newPlan.days.length - 1];
        const newDayNumber = lastDay.dayNumber + 1;
        
        // Create a new training day focused on a different area
        const existingFocuses = new Set(newPlan.days.map(d => d.focus));
        let newFocus = 'Full Body';
        
        // Try to find an unused focus
        const possibleFocuses = ['Upper Body', 'Lower Body', 'Core', 'Cardio', 'Full Body'];
        for (const focus of possibleFocuses) {
          if (!existingFocuses.has(focus)) {
            newFocus = focus;
            break;
          }
        }
        
        // Create new day
        const newDay: WorkoutDay = {
          dayNumber: newDayNumber,
          focus: newFocus,
          exercises: Array(3).fill(0).map(() => this.generateDefaultExercise(newFocus))
        };
        
        newPlan.days.push(newDay);
      } else if (change.type === 'removeDay' && typeof change.dayIndex === 'number') {
        // Remove training day
        newPlan.days.splice(change.dayIndex, 1);
      } else if (change.type === 'changeRest') {
        // Add rest day or adjust rest
        const dayIndices = newPlan.days.map((_, i) => i);
        // Find most suitable day to be rest day
        const restDayIndex = dayIndices.find(i => 
          !newPlan.days[i].focus.toLowerCase().includes('rest')
        );
        
        if (restDayIndex !== undefined) {
          // Convert this day to a rest day
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
    
    // Update plan metadata
    newPlan.name = `${newPlan.name} (Adjusted)`;
    newPlan.createdAt = new Date().toISOString();
    
    return newPlan;
  }
  
  private generateDefaultExercise(focus: string): any {
    // Use exercise generator from workout plan generator
    const defaultExercises: Record<string, any> = {
      'Upper Body': {
        name: 'Push-Ups',
        sets: 3,
        reps: 12,
        restTime: 60,
        intensity: 'Medium'
      },
      'Lower Body': {
        name: 'Bodyweight Squats',
        sets: 3,
        reps: 15,
        restTime: 60,
        intensity: 'Medium'
      },
      'Core': {
        name: 'Plank',
        sets: 3,
        duration: 45,
        restTime: 45,
        intensity: 'Medium'
      },
      'Cardio': {
        name: 'Jumping Jacks',
        sets: 3,
        duration: 60,
        restTime: 30,
        intensity: 'Medium'
      },
      'Full Body': {
        name: 'Burpees',
        sets: 3,
        reps: 10,
        restTime: 60,
        intensity: 'High'
      }
    };
    
    return defaultExercises[focus] || defaultExercises['Full Body'];
  }
}