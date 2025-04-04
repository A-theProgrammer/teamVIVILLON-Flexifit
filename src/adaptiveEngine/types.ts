import { WorkoutPlan, WorkoutExercise } from '@/types/user';

export interface AdaptiveParameters {
  intensity: number;      // 0-1 intensity parameter
  volume: number;         // 0-1 training volume parameter
  frequency: number;      // weekly training frequency
  restPeriod: number;     // recommended rest time in seconds
  progression: number;    // progression rate (0-1)
}

export interface UserFeedback {
  exerciseId: string;
  difficulty: number;     // 1-5 difficulty rating
  fatigue: number;        // 1-5 fatigue level
  enjoyment: number;      // 1-5 enjoyment level
  completionTime: number; // actual completion time in seconds
  notes?: string;
}

export interface UserMetrics {
  completionRate: number;     // Completion rate (0-1)
  consistencyScore: number;   // Consistency score (0-1)
  improvementRate: number;    // Improvement rate (-1 to 1)
  adherenceScore: number;     // Adherence score (0-1)
}

export interface UserState {
  userId: string;
  currentPlan: WorkoutPlan | null;
  feedbackHistory: UserFeedback[];
  metrics: UserMetrics;
  adaptiveParams: AdaptiveParameters;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  targetGoals: string[];
  completedWorkouts: number;
  lastWorkoutDate?: Date;
  healthStatus: string[];
}

export interface AdjustmentResult {
  parameters: AdaptiveParameters;
  exerciseChanges: ExerciseAdjustment[];
  planStructureChanges: PlanStructureChange[];
  message: string; // Message explaining the adjustments
}

export interface ExerciseAdjustment {
  exerciseId: string;
  adjustmentType: 'replace' | 'modify' | 'keep';
  newExercise?: WorkoutExercise;
  paramChanges?: Partial<WorkoutExercise>;
  reason: string;
}

export interface PlanStructureChange {
  type: 'addDay' | 'removeDay' | 'reorderDay' | 'changeRest';
  dayIndex?: number;
  newPosition?: number;
  reason: string;
}

export enum ProgressionLevel {
  Deload = -1,           // Deload period
  Maintenance = 0,       // Maintain current difficulty
  SlowProgress = 0.25,   // Slow progression
  NormalProgress = 0.5,  // Standard progression
  FastProgress = 0.75,   // Fast progression
  Breakthrough = 1       // Breakthrough progression
}