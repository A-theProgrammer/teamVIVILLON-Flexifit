import { UserProfiler } from './UserProfiler';
import { FeedbackAnalyzer } from './FeedbackAnalyzer';
import { WorkoutAdjuster } from './WorkoutAdjuster';
import { UserState, AdjustmentResult, ProgressionLevel } from './types';
import { WorkoutPlan, UserModel, WorkoutExercise, WorkoutDay } from '@/types/user';

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
    
    const recentHealthIssues = this.identifyRecentHealthIssues(user);
    
    let safetyAdjustedPlan = currentPlan;
    if (recentHealthIssues.length > 0 && currentPlan) {
      safetyAdjustedPlan = this.applySafetyAdjustments(currentPlan, recentHealthIssues);
    }
    
    const progressionLevel = this.feedbackAnalyzer.analyzeUserProgression(userState);
    const problematicExercises = this.feedbackAnalyzer.identifyProblematicExercises(feedbackHistory);
    
    const allProblematicExercises = [
      ...problematicExercises,
      ...this.getExercisesAffectedByHealthIssues(safetyAdjustedPlan, recentHealthIssues)
    ];
    
    const adjustmentResult = this.workoutAdjuster.adjustWorkoutPlan(
      userState,
      allProblematicExercises,
      progressionLevel
    );
    
    const adjustedPlan = this.applyAdjustments(safetyAdjustedPlan!, adjustmentResult);
    
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
    
    // Apply plan structure adjustments
    for (const change of adjustments.planStructureChanges) {
      if (change.type === 'addDay' && newPlan.days.length < 7) {
        // Add new training day
        const lastDay = newPlan.days[newPlan.days.length - 1];
        const newDayNumber = lastDay.dayNumber + 1;
        
        // Create a new day focused on a different area
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
  
  /**
   * Generate default exercise for newly added days
   */
  private generateDefaultExercise(focus: string): WorkoutExercise {
    // Default exercises by focus
    const defaultExercises: Record<string, WorkoutExercise> = {
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
  
  // Helper method to identify recent health issues
  private identifyRecentHealthIssues(user: UserModel): any[] {
    const healthStatus = user.staticAttributes?.basicInformation?.healthStatus;
    if (!healthStatus || healthStatus.length === 0) return [];
    
    // Get health issues reported in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return healthStatus.filter(status => {
      if (typeof status === 'string') return true; // Handle old format
      const reportDate = new Date(status.reportedDate);
      return reportDate >= thirtyDaysAgo;
    });
  }
  
  // Safety adjustment method - immediately removes dangerous exercises
  private applySafetyAdjustments(plan: WorkoutPlan, healthIssues: any[]): WorkoutPlan {
    const adjustedPlan = { ...plan, days: JSON.parse(JSON.stringify(plan.days)) };
    
    // Create mapping of body parts to exercise types to avoid
    const restrictedMovements: Record<string, string[]> = {
      'knee': ['squat', 'lunge', 'jump', 'knee extension', 'burpee'],
      'back': ['deadlift', 'bent over', 'twist', 'sit-up', 'crunch'],
      'shoulder': ['overhead press', 'lateral raise', 'upright row', 'push-up'],
      'wrist': ['push-up', 'press', 'curl', 'plank'],
      'ankle': ['jump', 'run', 'lunge', 'squat', 'calf'],
      'hip': ['squat', 'lunge', 'deadlift', 'leg raise'],
      'neck': ['overhead', 'shoulder press', 'pull-up'],
      'elbow': ['curl', 'push-up', 'press', 'dip']
    };
    
    // Get all affected areas
    const affectedAreas = healthIssues.flatMap(issue => {
      if (typeof issue === 'string') {
        // Try to extract body part from string
        for (const [area, _] of Object.entries(restrictedMovements)) {
          if (issue.toLowerCase().includes(area)) {
            return [area];
          }
        }
        return [];
      }
      return issue.affectedAreas;
    });
    
    // Get list of movements to avoid
    const movementsToAvoid = affectedAreas.flatMap(area => restrictedMovements[area] || []);
    
    // Replace problematic exercises
    adjustedPlan.days.forEach(day => {
      day.exercises.forEach((exercise, index) => {
        // Check if exercise name contains any restricted movement
        const isRestricted = movementsToAvoid.some(movement => 
          exercise.name.toLowerCase().includes(movement.toLowerCase())
        );
        
        if (isRestricted) {
          // Replace with a safe alternative
          day.exercises[index] = this.getSafeAlternativeExercise(exercise, day.focus, affectedAreas);
        }
      });
    });
    
    // Add injury info to plan description
    adjustedPlan.description = `${adjustedPlan.description} (Adjusted for health conditions)`;
    
    return adjustedPlan;
  }
  
  // Get safe alternative exercise that avoids affected body parts
  private getSafeAlternativeExercise(
    originalExercise: WorkoutExercise, 
    focus: string, 
    affectedAreas: string[]
  ): WorkoutExercise {
    // Database of safe alternative exercises
    const alternatives: Record<string, Record<string, WorkoutExercise>> = {
      'knee': {
        'legs': {
          name: 'Seated Leg Curl',
          sets: 3,
          reps: 12,
          restTime: 60,
          intensity: 'Medium',
          notes: 'Modified for knee limitation - avoid deep knee bending'
        },
        'cardio': {
          name: 'Upper Body Ergometer',
          duration: 15,
          intensity: 'Medium',
          notes: 'Modified cardio that doesn\'t stress the knees'
        },
        'full body': {
          name: 'Seated Upper Body Training',
          sets: 3,
          reps: 12,
          restTime: 60,
          intensity: 'Medium',
          notes: 'Focus on upper body and core, avoiding knee stress'
        }
      },
      'back': {
        'back': {
          name: 'Gentle Wall Slides',
          sets: 3,
          reps: 10,
          restTime: 60,
          intensity: 'Low',
          notes: 'Back-friendly exercise, maintaining neutral spine position'
        },
        'core': {
          name: 'Static Core Bracing',
          sets: 3,
          duration: 20,
          restTime: 45,
          intensity: 'Low',
          notes: 'Avoiding spinal flexion or rotation, focus on isometric contractions'
        }
      },
      'shoulder': {
        'upper body': {
          name: 'Modified Dumbbell Row',
          sets: 3,
          reps: 12,
          restTime: 60,
          intensity: 'Medium',
          notes: 'Shoulder-friendly rowing variation focusing on lats rather than deltoids'
        },
        'push': {
          name: 'Neutral Grip Chest Press',
          sets: 3,
          reps: 12,
          restTime: 60,
          intensity: 'Medium',
          notes: 'Shoulder-joint friendly pressing, avoiding excessive abduction'
        }
      }
      // Can add more body part alternatives
    };
    
    // Try to find a suitable alternative for each affected area
    for (const area of affectedAreas) {
      if (alternatives[area]) {
        // Try to find specific body part specific focus alternative
        if (alternatives[area][focus.toLowerCase()]) {
          return {
            ...originalExercise, // Keep sets/reps structure
            ...alternatives[area][focus.toLowerCase()], // Override with safe exercise
          };
        }
        
        // If no specific focus alternative, use any available
        const anyFocus = Object.keys(alternatives[area])[0];
        if (anyFocus) {
          return {
            ...originalExercise,
            ...alternatives[area][anyFocus],
            notes: `Modified for ${area} limitation. This is a safe alternative.`
          };
        }
      }
    }
    
    // If no specific alternative, use a generic safe exercise
    return {
      name: 'Modified ' + originalExercise.name,
      sets: originalExercise.sets,
      reps: originalExercise.reps,
      restTime: originalExercise.restTime,
      intensity: 'Low',
      notes: 'Modified to accommodate your current limitations. Focus on pain-free range of motion.'
    };
  }
  
  // Get exercises affected by health issues
  private getExercisesAffectedByHealthIssues(plan: WorkoutPlan | null, healthIssues: any[]): string[] {
    if (!plan || healthIssues.length === 0) return [];
    
    const affectedExercises: string[] = [];
    
    // Extract affected body parts
    const affectedAreas = healthIssues.flatMap(issue => {
      if (typeof issue === 'string') {
        // Extract body part from string
        const areas = ['knee', 'back', 'shoulder', 'wrist', 'ankle', 'hip', 'neck', 'elbow'];
        for (const area of areas) {
          if (issue.toLowerCase().includes(area)) {
            return [area];
          }
        }
        return [];
      }
      return issue.affectedAreas;
    });
    
    // Body part to keywords mapping
    const areaKeywords: Record<string, string[]> = {
      'knee': ['squat', 'lunge', 'jump', 'knee'],
      'back': ['deadlift', 'row', 'twist', 'bend'],
      'shoulder': ['press', 'raise', 'push-up', 'overhead'],
      'wrist': ['curl', 'press', 'push-up', 'plank'],
      'ankle': ['jump', 'run', 'squat', 'lunge'],
      'hip': ['squat', 'lunge', 'thrust', 'bridge'],
      'neck': ['military', 'overhead', 'shoulder press'],
      'elbow': ['curl', 'extension', 'push-up', 'dip']
    };
    
    // Iterate through all exercises in the plan
    plan.days.forEach((day, dayIndex) => {
      day.exercises.forEach((exercise, exIndex) => {
        const exerciseId = `${day.dayNumber}-${exIndex}`;
        const exerciseName = exercise.name.toLowerCase();
        
        // Check if exercise contains any keywords for affected areas
        for (const area of affectedAreas) {
          const keywords = areaKeywords[area] || [];
          if (keywords.some(keyword => exerciseName.includes(keyword))) {
            affectedExercises.push(exerciseId);
            break;
          }
        }
      });
    });
    
    return affectedExercises;
  }
}