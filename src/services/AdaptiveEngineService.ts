import { AdaptiveEngine } from '../adaptiveEngine/AdaptiveEngine';
import { UserModel, WorkoutPlan } from '../types/user';
import { AdjustmentResult } from '../adaptiveEngine/types';

export class AdaptiveEngineService {
  private engine: AdaptiveEngine;
  private lastAdaptiveChanges: AdjustmentResult | null = null;
  
  constructor() {
    this.engine = new AdaptiveEngine();
  }
  
  /**
   * Generate an adaptive workout plan based on user data, current plan, and feedback
   */
  generateAdaptivePlan(user: UserModel, currentPlan: WorkoutPlan | null, feedbackHistory: any[]): WorkoutPlan {
    try {
      const adaptedPlan = this.engine.generateAdaptiveWorkoutPlan(
        user, 
        currentPlan, 
        feedbackHistory
      );
      
      // Store the last adaptive changes for UI display
      // In a real implementation, we would access this from the engine
      // Since we don't have direct access to the adjustment result here,
      // in a real app we would modify AdaptiveEngine to return this
      // For now, we'll simulate this
      this.simulateAdaptiveChanges(currentPlan, adaptedPlan);
      
      return adaptedPlan;
    } catch (error) {
      console.error('Error in adaptive plan generation:', error);
      // Return the current plan if there's an error
      return currentPlan || this.createDefaultPlan();
    }
  }
  
  /**
   * Get the last adaptive changes for display purposes
   */
  getLastAdaptiveChanges(): AdjustmentResult | null {
    return this.lastAdaptiveChanges;
  }
  
  /**
   * Simulate adaptive changes for demonstration purposes
   * In a real implementation, this data would come from the AdaptiveEngine
   */
  private simulateAdaptiveChanges(oldPlan: WorkoutPlan | null, newPlan: WorkoutPlan): void {
    if (!oldPlan) {
      // If there was no old plan, just create a basic result
      this.lastAdaptiveChanges = {
        parameters: {
          intensity: 0.6,
          volume: 0.6,
          frequency: 3,
          restPeriod: 60,
          progression: 0.3
        },
        exerciseChanges: [],
        planStructureChanges: [],
        message: "Initial plan created based on your profile.",
        adjustmentReasons: ["First plan generation based on your profile"],
        
      };
      return;
    }
    
    // Compare old and new plans to simulate changes
    const exerciseChanges: any[] = [];
    const planStructureChanges: any[] = [];
    
    // Check for day count changes
    if (oldPlan.days.length !== newPlan.days.length) {
      if (oldPlan.days.length < newPlan.days.length) {
        planStructureChanges.push({
          type: 'addDay',
          reason: 'Added a new training day to increase frequency'
        });
      } else {
        planStructureChanges.push({
          type: 'removeDay',
          reason: 'Removed a training day to improve recovery'
        });
      }
    }
    
    // Check for exercise changes (simplified)
    for (let i = 0; i < Math.min(oldPlan.days.length, newPlan.days.length); i++) {
      const oldDay = oldPlan.days[i];
      const newDay = newPlan.days[i];
      
      // Check focus changes
      if (oldDay.focus !== newDay.focus) {
        planStructureChanges.push({
          type: 'changeFocus',
          dayIndex: i,
          oldFocus: oldDay.focus,
          newFocus: newDay.focus,
          reason: `Changed day ${i+1} focus from ${oldDay.focus} to ${newDay.focus} for better balance`
        });
      }
      
      // Check exercise changes
      for (let j = 0; j < Math.min(oldDay.exercises.length, newDay.exercises.length); j++) {
        const oldExercise = oldDay.exercises[j];
        const newExercise = newDay.exercises[j];
        
        if (oldExercise.name !== newExercise.name) {
          exerciseChanges.push({
            exerciseId: `${i+1}-${j}`,
            adjustmentType: 'replace',
            oldExercise: oldExercise,
            newExercise: newExercise,
            reason: `Replaced ${oldExercise.name} with ${newExercise.name} for better results`
          });
        } else if (
          oldExercise.sets !== newExercise.sets || 
          oldExercise.reps !== newExercise.reps || 
          oldExercise.duration !== newExercise.duration
        ) {
          exerciseChanges.push({
            exerciseId: `${i+1}-${j}`,
            adjustmentType: 'modify',
            oldExercise: oldExercise,
            newExercise: newExercise,
            paramChanges: {
              sets: newExercise.sets,
              reps: newExercise.reps,
              duration: newExercise.duration,
              restTime: newExercise.restTime
            },
            reason: 'Adjusted parameters for progressive overload'
          });
        }
      }
    }
    
    // Create the simulated result
    this.lastAdaptiveChanges = {
      parameters: {
        intensity: 0.65,
        volume: 0.7,
        frequency: newPlan.days.length,
        restPeriod: 45,
        progression: 0.4
      },
      exerciseChanges,
      planStructureChanges,
      message: "Your plan has been adapted based on your progress and feedback.",
      adjustmentReasons: [
        "Adjusted based on your feedback and performance",
        "Modified parameters to ensure continued progress",
        exerciseChanges.length > 0 ? `Changed ${exerciseChanges.length} exercises for better results` : "",
        planStructureChanges.length > 0 ? `Made ${planStructureChanges.length} structural changes to your plan` : ""
      ].filter(reason => reason !== "")
    };
  }
  
  /**
   * Create a default plan in case of errors
   */
  private createDefaultPlan(): WorkoutPlan {
    return {
      id: `default_${Date.now()}`,
      name: "Basic Workout Plan",
      description: "A simple workout plan with basic exercises",
      createdAt: new Date().toISOString(),
      days: [
        {
          dayNumber: 1,
          focus: "Full Body",
          exercises: [
            { name: "Push-ups", sets: 3, reps: 10, restTime: 60, intensity: "Medium" },
            { name: "Bodyweight Squats", sets: 3, reps: 15, restTime: 60, intensity: "Medium" },
            { name: "Plank", duration: 30, sets: 3, restTime: 45, intensity: "Medium" }
          ]
        },
        {
          dayNumber: 2,
          focus: "Rest",
          exercises: [
            { name: "Active Recovery", duration: 20, intensity: "Low", notes: "Light walking or stretching" }
          ]
        },
        {
          dayNumber: 3,
          focus: "Full Body",
          exercises: [
            { name: "Push-ups", sets: 3, reps: 10, restTime: 60, intensity: "Medium" },
            { name: "Bodyweight Squats", sets: 3, reps: 15, restTime: 60, intensity: "Medium" },
            { name: "Plank", duration: 30, sets: 3, restTime: 45, intensity: "Medium" }
          ]
        }
      ]
    };
  }
}