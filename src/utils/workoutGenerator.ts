// src/utils/workoutGenerator.ts

import { ConversationState } from '@/types/chat';
import { WorkoutPlan, WorkoutExercise, UserModel } from '@/types/user';
import { AdaptiveEngine } from '@/adaptiveEngine/AdaptiveEngine';

export const generateWorkoutPlan = (
  conversationState: ConversationState, 
  userGoal?: string, 
  userExperience?: string,
  user?: UserModel | null,              // Added user parameter
  currentPlan?: WorkoutPlan | null,     // Added current plan parameter
  feedbackHistory?: any[]               // Added feedback history parameter
): WorkoutPlan => {
  // Check if we should use the adaptive algorithm
  if (user && (currentPlan || user.dynamicAttributes?.workoutProgress?.completedExercises?.length > 10)) {
    try {
      const adaptiveEngine = new AdaptiveEngine();
      console.log("Using adaptive engine to generate workout plan");
      
      // Generate new plan using adaptive algorithm
      return adaptiveEngine.generateAdaptiveWorkoutPlan(
        user, 
        currentPlan || null, 
        feedbackHistory || []
      );
    } catch (error) {
      console.error('Adaptive engine error, falling back to standard generator:', error);
      // Fall back to standard generation if adaptive engine fails
    }
  }
  
  // This is a mock function that would be replaced with actual API call
  // to generate a workout plan based on user information
  const goals = userGoal || conversationState.fitnessGoals || 'general_health';
  const experience = userExperience || conversationState.experienceLevel || 'beginner';
  const location = conversationState.workoutLocation || 'both';
  const targetBodyAreas = conversationState.targetBodyAreas || [];
  
  const getRandomInt = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };
  
  let planName: string;
  let planDescription: string;
  let focusAreas: string[];
  
  switch (goals) {
    case 'fat_loss':
      planName = 'Fat Burning Plan';
      planDescription = 'High-intensity training focused on calorie burn and metabolic conditioning';
      focusAreas = ['HIIT Cardio', 'Core', 'Full Body', 'Active Recovery'];
      break;
    case 'muscle_gain':
      planName = 'Muscle Building Plan';
      planDescription = 'Progressive overload training focused on hypertrophy and strength';
      focusAreas = ['Upper Body', 'Lower Body', 'Push', 'Pull', 'Legs', 'Rest'];
      break;
    case 'endurance':
      planName = 'Endurance Training Plan';
      planDescription = 'Cardiovascular and muscular endurance to improve stamina';
      focusAreas = ['Long Duration Cardio', 'Tempo Training', 'Circuit Training', 'Recovery'];
      break;
    default:
      planName = 'General Fitness Plan';
      planDescription = 'Balanced fitness routine for overall health and wellness';
      focusAreas = ['Cardio', 'Strength', 'Flexibility', 'Rest'];
  }
  
  // Customize focus based on selected body areas
  if (targetBodyAreas && targetBodyAreas.length > 0) {
    // Map body areas to focus areas
    const bodyAreaToFocus: Record<string, string> = {
      'chest': 'Chest',
      'back': 'Back',
      'shoulders': 'Shoulders',
      'arms': 'Arms',
      'legs': 'Legs',
      'core': 'Core',
      'cardio': 'Cardio',
    };
    
    // Replace some focus areas with targeted body areas
    const customFocusAreas = targetBodyAreas.map(area => bodyAreaToFocus[area] || area);
    
    // Always keep at least one rest day
    if (!customFocusAreas.includes('Rest')) {
      customFocusAreas.push('Rest');
    }
    
    focusAreas = customFocusAreas;
    planDescription += ` (Focused on ${targetBodyAreas.join(', ')})`;
  }
  
  // Adjust for workout location
  if (location === 'home') {
    planDescription += ' (Home-based exercises with minimal equipment)';
  } else if (location === 'gym') {
    planDescription += ' (Gym-based exercises utilizing available equipment)';
  }
  
  // Adjust for injuries if present
  if (conversationState.injuries && conversationState.injuries.length > 0) {
    planDescription += ' (Modified for your specific needs)';
  }
  
  // Personalize the plan name based on who it's for
  if (conversationState.userName && conversationState.forWhom === 'self') {
    planName = `${conversationState.userName}'s ${planName}`;
  } else if (conversationState.forWhom !== 'self' && conversationState.forWhom) {
    planName = `${conversationState.forWhom}'s ${planName}`;
  }
  
  const days: any[] = [];
  const daysPerWeek = conversationState.workoutFrequency || 
                      (experience === 'beginner' ? 3 : experience === 'intermediate' ? 4 : 5);
  
  for (let i = 1; i <= daysPerWeek; i++) {
    const focus = focusAreas[i % focusAreas.length];
    const exerciseCount = getRandomInt(3, 6);
    const exercises = [];
    
    for (let j = 0; j < exerciseCount; j++) {
      const exercise = getExerciseForFocus(focus, location);
      exercises.push(exercise);
    }
    
    days.push({
      dayNumber: i,
      focus,
      exercises
    });
  }
  
  return {
    id: `plan_${Date.now()}`,
    name: planName,
    description: planDescription,
    createdAt: new Date().toISOString(),
    days,
    targetBodyAreas: targetBodyAreas.length > 0 ? targetBodyAreas : undefined
  };
};

export const getExerciseForFocus = (focus: string, location: string = 'both'): any => {
  // Enhanced mock exercise database based on focus area and workout location
  const homeExercises: any = {
    'HIIT Cardio': [
      { name: 'Burpees', sets: 3, reps: 12, restTime: 30, intensity: 'High' },
      { name: 'Mountain Climbers', sets: 3, reps: 20, restTime: 30, intensity: 'High' },
      { name: 'Jump Squats', sets: 3, reps: 15, restTime: 30, intensity: 'High' }
    ],
    'Core': [
      { name: 'Plank', sets: 3, duration: 45, restTime: 45, intensity: 'Medium' },
      { name: 'Russian Twists', sets: 3, reps: 20, restTime: 45, intensity: 'Medium' },
      { name: 'Leg Raises', sets: 3, reps: 12, restTime: 45, intensity: 'Medium' }
    ],
    'Upper Body': [
      { name: 'Push-Ups', sets: 3, reps: 12, restTime: 60, intensity: 'Medium' },
      { name: 'Pike Push-Ups', sets: 3, reps: 10, restTime: 60, intensity: 'Medium' },
      { name: 'Door Frame Rows', sets: 3, reps: 12, restTime: 60, intensity: 'Medium' }
    ],
    'Lower Body': [
      { name: 'Bodyweight Squats', sets: 3, reps: 15, restTime: 60, intensity: 'Medium' },
      { name: 'Lunges', sets: 3, reps: 12, restTime: 60, intensity: 'Medium' },
      { name: 'Glute Bridges', sets: 3, reps: 15, restTime: 45, intensity: 'Medium' }
    ],
    'Cardio': [
      { name: 'High Knees', sets: 3, duration: 60, restTime: 30, intensity: 'Medium' },
      { name: 'Jumping Jacks', sets: 3, duration: 60, restTime: 30, intensity: 'Medium' },
      { name: 'Stair Climbing', duration: 15, intensity: 'Medium' }
    ],
    'Full Body': [
      { name: 'Inchworm', sets: 3, reps: 10, restTime: 45, intensity: 'Medium' },
      { name: 'Star Jumps', sets: 3, reps: 15, restTime: 30, intensity: 'Medium' },
      { name: 'Bodyweight Circuit', sets: 2, duration: 300, restTime: 60, intensity: 'High' }
    ],
    'Strength': [
      { name: 'Resistance Band Rows', sets: 3, reps: 12, restTime: 60, intensity: 'Medium' },
      { name: 'Resistance Band Chest Press', sets: 3, reps: 12, restTime: 60, intensity: 'Medium' },
      { name: 'Wall Sits', sets: 3, duration: 45, restTime: 45, intensity: 'Medium' }
    ],
    'Flexibility': [
      { name: 'Yoga Flow', duration: 20, intensity: 'Low' },
      { name: 'Dynamic Stretching', duration: 15, intensity: 'Low' },
      { name: 'Static Stretching', duration: 15, intensity: 'Low' }
    ],
    'Rest': [
      { name: 'Active Recovery - Light Walking', duration: 20, intensity: 'Low' },
      { name: 'Mobility Work', duration: 15, intensity: 'Low' },
      { name: 'Rest Day', intensity: 'None', notes: 'Take time to recover properly' }
    ],
    // Added specialized focus areas for targeted body parts
    'Chest': [
      { name: 'Standard Push-Ups', sets: 3, reps: 12, restTime: 60, intensity: 'Medium' },
      { name: 'Incline Push-Ups', sets: 3, reps: 15, restTime: 60, intensity: 'Medium' },
      { name: 'Decline Push-Ups', sets: 3, reps: 10, restTime: 60, intensity: 'Medium' }
    ],
    'Back': [
      { name: 'Superman Hold', sets: 3, duration: 30, restTime: 45, intensity: 'Medium' },
      { name: 'Bent-Over Resistance Band Rows', sets: 3, reps: 12, restTime: 45, intensity: 'Medium' },
      { name: 'Reverse Snow Angels', sets: 3, reps: 12, restTime: 45, intensity: 'Medium' }
    ],
    'Shoulders': [
      { name: 'Pike Push-Ups', sets: 3, reps: 10, restTime: 60, intensity: 'Medium' },
      { name: 'Arm Circles', sets: 3, reps: 20, restTime: 30, intensity: 'Low' },
      { name: 'Resistance Band Shoulder Press', sets: 3, reps: 12, restTime: 60, intensity: 'Medium' }
    ],
    'Arms': [
      { name: 'Diamond Push-Ups', sets: 3, reps: 10, restTime: 60, intensity: 'Medium' },
      { name: 'Resistance Band Bicep Curls', sets: 3, reps: 15, restTime: 45, intensity: 'Medium' },
      { name: 'Tricep Dips', sets: 3, reps: 12, restTime: 60, intensity: 'Medium' }
    ],
    'Legs': [
      { name: 'Bodyweight Squats', sets: 3, reps: 15, restTime: 60, intensity: 'Medium' },
      { name: 'Walking Lunges', sets: 3, reps: 20, restTime: 60, intensity: 'Medium' },
      { name: 'Calf Raises', sets: 3, reps: 20, restTime: 45, intensity: 'Medium' }
    ]
  };
  
  const gymExercises: any = {
    'HIIT Cardio': [
      { name: 'Treadmill Sprints', sets: 5, duration: 30, restTime: 60, intensity: 'High' },
      { name: 'Battle Ropes', sets: 3, duration: 30, restTime: 45, intensity: 'High' },
      { name: 'Box Jumps', sets: 4, reps: 10, restTime: 60, intensity: 'High' }
    ],
    'Core': [
      { name: 'Cable Crunches', sets: 3, reps: 15, restTime: 45, intensity: 'Medium' },
      { name: 'Hanging Leg Raises', sets: 3, reps: 12, restTime: 60, intensity: 'High' },
      { name: 'Ab Rollouts', sets: 3, reps: 10, restTime: 60, intensity: 'High' }
    ],
    'Upper Body': [
      { name: 'Bench Press', sets: 4, reps: 10, restTime: 90, intensity: 'High' },
      { name: 'Lat Pulldown', sets: 4, reps: 12, restTime: 90, intensity: 'Medium' },
      { name: 'Shoulder Press', sets: 3, reps: 10, restTime: 90, intensity: 'Medium' }
    ],
    'Lower Body': [
      { name: 'Barbell Squats', sets: 4, reps: 8, restTime: 120, intensity: 'High' },
      { name: 'Leg Press', sets: 3, reps: 12, restTime: 90, intensity: 'Medium' },
      { name: 'Hamstring Curls', sets: 3, reps: 12, restTime: 60, intensity: 'Medium' }
    ],
    'Push': [
      { name: 'Incline Bench Press', sets: 3, reps: 10, restTime: 90, intensity: 'Medium' },
      { name: 'Dumbbell Shoulder Press', sets: 3, reps: 10, restTime: 90, intensity: 'Medium' },
      { name: 'Tricep Pushdown', sets: 3, reps: 12, restTime: 60, intensity: 'Medium' }
    ],
    'Pull': [
      { name: 'Barbell Rows', sets: 3, reps: 10, restTime: 90, intensity: 'Medium' },
      { name: 'Pull-Ups', sets: 3, reps: 8, restTime: 90, intensity: 'Medium' },
      { name: 'Bicep Curls', sets: 3, reps: 12, restTime: 60, intensity: 'Medium' }
    ],
    'Legs': [
      { name: 'Deadlifts', sets: 4, reps: 8, restTime: 120, intensity: 'High' },
      { name: 'Leg Extensions', sets: 3, reps: 12, restTime: 60, intensity: 'Medium' },
      { name: 'Calf Raises', sets: 4, reps: 15, restTime: 45, intensity: 'Medium' }
    ],
    'Cardio': [
      { name: 'Stairmaster', duration: 20, intensity: 'Medium' },
      { name: 'Rowing Machine', duration: 15, intensity: 'Medium' },
      { name: 'Elliptical Trainer', duration: 25, intensity: 'Medium' }
    ],
    'Rest': [
      { name: 'Active Recovery - Light Cardio', duration: 20, intensity: 'Low' },
      { name: 'Stretching Session', duration: 20, intensity: 'Low' },
      { name: 'Rest Day', intensity: 'None', notes: 'Take time to recover properly' }
    ],
    // Added specialized focus areas for targeted body parts
    'Chest': [
      { name: 'Barbell Bench Press', sets: 4, reps: 10, restTime: 90, intensity: 'High' },
      { name: 'Incline Dumbbell Press', sets: 3, reps: 12, restTime: 90, intensity: 'Medium' },
      { name: 'Cable Flyes', sets: 3, reps: 15, restTime: 60, intensity: 'Medium' }
    ],
    'Back': [
      { name: 'Barbell Rows', sets: 4, reps: 10, restTime: 90, intensity: 'High' },
      { name: 'Lat Pulldown', sets: 3, reps: 12, restTime: 60, intensity: 'Medium' },
      { name: 'Seated Cable Row', sets: 3, reps: 12, restTime: 60, intensity: 'Medium' }
    ],
    'Shoulders': [
      { name: 'Overhead Press', sets: 4, reps: 8, restTime: 90, intensity: 'High' },
      { name: 'Lateral Raises', sets: 3, reps: 15, restTime: 60, intensity: 'Medium' },
      { name: 'Face Pulls', sets: 3, reps: 15, restTime: 60, intensity: 'Medium' }
    ],
    'Arms': [
      { name: 'Barbell Curls', sets: 3, reps: 12, restTime: 60, intensity: 'Medium' },
      { name: 'Skull Crushers', sets: 3, reps: 12, restTime: 60, intensity: 'Medium' },
      { name: 'Cable Tricep Pushdown', sets: 3, reps: 15, restTime: 60, intensity: 'Medium' }
    ]
  };
  
  // Select exercises based on location
  let availableExercises;
  if (location === 'home') {
    availableExercises = homeExercises[focus] || homeExercises['Cardio'];
  } else if (location === 'gym') {
    availableExercises = gymExercises[focus] || gymExercises['Cardio'];
  } else {
    // If 'both' or unspecified, randomly choose between home and gym exercises
    const useGym = Math.random() > 0.5;
    availableExercises = useGym 
      ? (gymExercises[focus] || gymExercises['Cardio'])
      : (homeExercises[focus] || homeExercises['Cardio']);
  }
  
  // Select a random exercise from the available options
  return availableExercises[Math.floor(Math.random() * availableExercises.length)];
};