
export interface UserModel {
  userId: string;
  staticAttributes: {
    basicInformation: {
      age: number;
      gender: "male" | "female" | "other";
      height: number;
      weight: number;
      healthStatus?: string[];
    };
    fitnessGoals: {
      primaryGoal: "fat_loss" | "muscle_gain" | "endurance" | "general_health";
    };
    exerciseBackground: {
      experienceLevel: "beginner" | "intermediate" | "advanced";
      currentExerciseHabits: {
        frequencyPerWeek: number;
        sessionDuration: number;
      };
    };
  };
  dynamicAttributes: {
    trainingData: Array<{
      sessionId: string;
      sessionDuration: number;
      exercises: Array<{
        name: string;
        duration?: number;
        sets?: number;
        reps?: number;
        intensity?: string;
      }>;
      trainingIntensity?: number;
      completionDetails?: {
        caloriesBurned?: number;
        sets?: number;
        reps?: number;
      };
      timestamp: string;
    }>;
    userFeedback?: {
      difficultyScore?: number;
      feedbackNotes?: string;
    };
    behavioralData?: {
      usageRecords?: Array<{
        timestamp: string;
        page: string;
        action: string;
        duration?: number;
      }>;
      adjustmentRecords?: Array<{
        timestamp: string;
        action: string;
        details?: string;
      }>;
    };
    workoutProgress?: {
      completedExercises: string[];
      lastWorkout: string;
      streakDays: number;
    };
    savedWorkoutPlans?: WorkoutPlan[];
  };
}

export interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  days: WorkoutDay[];
  targetBodyAreas?: string[]; // Added for body area targeting
}

export interface WorkoutDay {
  dayNumber: number;
  focus: string;
  exercises: WorkoutExercise[];
}

export interface WorkoutExercise {
  name: string;
  sets?: number;
  reps?: number;
  duration?: number;
  restTime?: number;
  intensity?: string;
  notes?: string;
}
