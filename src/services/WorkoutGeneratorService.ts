import { generateWorkoutPlan } from '../utils/workoutGenerator';
import { ConversationState } from '../types/chat';
import { UserModel, WorkoutPlan } from '../types/user';

export class WorkoutGeneratorService {
  /**
   * Generate a workout plan based on conversation state and user data
   */
  generatePlan(
    conversationState: ConversationState,
    userGoal?: string,
    userExperience?: string,
    user?: UserModel | null,
    currentPlan?: WorkoutPlan | null,
    feedbackHistory?: any[]
  ): WorkoutPlan {
    try {
      return generateWorkoutPlan(
        conversationState,
        userGoal,
        userExperience,
        user,
        currentPlan,
        feedbackHistory
      );
    } catch (error) {
      console.error('Error generating workout plan:', error);
      return this.createDefaultPlan();
    }
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