import { WorkoutPlan, WorkoutExercise } from '../types/user';

export interface AdaptiveParameters {
  intensity: number;      // 0-1 intensity parameter
  volume: number;         // 0-1 training volume parameter
  frequency: number;      // weekly training frequency
  restPeriod: number;     // recommended rest time in seconds
  progression: number;    // progression rate (0-1)
  periodizationFactor?: number; // New: periodization amplitude parameter
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
  perceivedEffortScore?: number; // New: perceived effort (0-1)
  varietyScore?: number;      // New: exercise variety (0-1)
  balanceScore?: number;      // New: training balance (0-1)
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
  preferredTimeOfDay?: string;    // New: preferred workout time
  exercisePreferences?: Record<string, number>; // New: exercise preferences
  bodyMetrics?: any;              // New: body metrics and ideal parameters
}

export interface AdjustmentResult {
  parameters: AdaptiveParameters;
  exerciseChanges: ExerciseAdjustment[];
  planStructureChanges: PlanStructureChange[];
  message: string; // Message explaining the adjustments
  adjustmentReasons: string[]; // New: detailed reasons for adjustments
}

export interface ExerciseAdjustment {
  exerciseId: string;
  adjustmentType: 'replace' | 'modify' | 'keep';
  newExercise?: WorkoutExercise;
  oldExercise?: WorkoutExercise;
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
  Deload = -1,               // Deload period
  Maintenance = 0,           // Maintain current difficulty
  VerySlowProgress = 0.15,   // New: very slow progression
  SlowProgress = 0.3,        // Slow progression (adjusted)
  NormalProgress = 0.5,      // Standard progression
  ModerateProgress = 0.65,   // New: moderate progression
  FastProgress = 0.8,        // Fast progression (adjusted)
  Breakthrough = 1           // Breakthrough progression
}

// New: Training split types for more structured programming
export enum TrainingSplitType {
  FullBody = 'full_body',        // Each session trains the whole body
  UpperLower = 'upper_lower',    // Alternates upper and lower body
  PushPullLegs = 'push_pull_legs', // Split by movement pattern
  BodyPart = 'body_part'        // Split by specific body parts
}

// New: Exercise difficulty ratings
export enum ExerciseDifficulty {
  Beginner = 'beginner',
  Intermediate = 'intermediate',
  Advanced = 'advanced'
}

// New: Exercise categories for better classification
export enum ExerciseCategory {
  Strength = 'strength',
  Hypertrophy = 'hypertrophy',
  Endurance = 'endurance',
  Power = 'power',
  Flexibility = 'flexibility',
  Balance = 'balance',
  Cardio = 'cardio'
}

// New: Training phase for periodization
export enum TrainingPhase {
  Accumulation = 'accumulation',  // Higher volume, lower intensity
  Intensification = 'intensification', // Higher intensity, lower volume
  Realization = 'realization',    // Peak performance, competition prep
  Recovery = 'recovery'           // Active recovery phase
}