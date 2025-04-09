import { UserModel } from '@/types/user';
import { generateWorkoutPlan } from './workoutGenerator';

// Create sample user data
export const sampleUsers: UserModel[] = [
  {
    userId: 'user_beginner_weight_loss',
    staticAttributes: {
      basicInformation: {
        age: 32,
        gender: 'female',
        height: 165,
        weight: 75,
        name: 'Sarah Chen',
        location: 'New York',
        healthStatus: []
      },
      fitnessGoals: {
        primaryGoal: 'fat_loss'
      },
      exerciseBackground: {
        experienceLevel: 'beginner',
        currentExerciseHabits: {
          frequencyPerWeek: 2,
          sessionDuration: 30
        }
      }
    },
    dynamicAttributes: {
      trainingData: [],
      workoutProgress: {
        completedExercises: [],
        lastWorkout: '',
        streakDays: 0
      },
      savedWorkoutPlans: []
    }
  },
  
  {
    userId: 'user_intermediate_muscle',
    staticAttributes: {
      basicInformation: {
        age: 28,
        gender: 'male',
        height: 178,
        weight: 72,
        name: 'Michael Lee',
        location: 'Chicago',
        healthStatus: []
      },
      fitnessGoals: {
        primaryGoal: 'muscle_gain'
      },
      exerciseBackground: {
        experienceLevel: 'intermediate',
        currentExerciseHabits: {
          frequencyPerWeek: 4,
          sessionDuration: 60
        }
      }
    },
    dynamicAttributes: {
      trainingData: [],
      workoutProgress: {
        completedExercises: ['1-0', '1-1', '2-0', '3-1'],
        lastWorkout: new Date().toISOString(),
        streakDays: 3
      },
      savedWorkoutPlans: []
    }
  },
  
  {
    userId: 'user_advanced_endurance',
    staticAttributes: {
      basicInformation: {
        age: 35,
        gender: 'male',
        height: 182,
        weight: 75,
        name: 'Robert Johnson',
        location: 'Seattle',
        healthStatus: []
      },
      fitnessGoals: {
        primaryGoal: 'endurance'
      },
      exerciseBackground: {
        experienceLevel: 'advanced',
        currentExerciseHabits: {
          frequencyPerWeek: 5,
          sessionDuration: 90
        }
      }
    },
    dynamicAttributes: {
      trainingData: [],
      workoutProgress: {
        completedExercises: Array(15).fill(0).map((_, i) => `${(i % 5) + 1}-${i % 3}`),
        lastWorkout: new Date().toISOString(),
        streakDays: 12
      },
      savedWorkoutPlans: []
    }
  },
  
  {
    userId: 'user_senior_health',
    staticAttributes: {
      basicInformation: {
        age: 67,
        gender: 'female',
        height: 160,
        weight: 62,
        name: 'Margaret Wilson',
        location: 'Miami',
        healthStatus: ['Mild arthritis', 'Controlled hypertension']
      },
      fitnessGoals: {
        primaryGoal: 'general_health'
      },
      exerciseBackground: {
        experienceLevel: 'beginner',
        currentExerciseHabits: {
          frequencyPerWeek: 3,
          sessionDuration: 20
        }
      }
    },
    dynamicAttributes: {
      trainingData: [],
      workoutProgress: {
        completedExercises: ['1-0', '2-1'],
        lastWorkout: new Date().toISOString(),
        streakDays: 1
      },
      savedWorkoutPlans: []
    }
  }
];

// Generate workout plans for sample users
export function generateSampleUserPlans() {
  return sampleUsers.map(user => {
    // Create corresponding conversation state
    const conversationState = {
      step: 2,
      userName: user.staticAttributes.basicInformation.name,
      forWhom: 'self',
      askedQuestions: new Set<string>([
        'fitness_goals', 'experience', 'frequency', 'location', 'injuries'
      ]),
      fitnessGoals: user.staticAttributes.fitnessGoals.primaryGoal,
      experienceLevel: user.staticAttributes.exerciseBackground.experienceLevel,
      workoutFrequency: user.staticAttributes.exerciseBackground.currentExerciseHabits.frequencyPerWeek,
      workoutLocation: 'both',
      injuries: user.staticAttributes.basicInformation.healthStatus,
      targetBodyAreas: []
    };
    
    // Use workout generator to create plan
    const plan = generateWorkoutPlan(
      conversationState,
      user.staticAttributes.fitnessGoals.primaryGoal,
      user.staticAttributes.exerciseBackground.experienceLevel,
      user
    );
    
    return {
      user,
      plan
    };
  });
}