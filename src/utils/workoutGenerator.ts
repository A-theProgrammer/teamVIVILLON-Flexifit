// src/utils/workoutGenerator.ts

import { ConversationState } from '../types/chat';
import { WorkoutPlan, WorkoutExercise, UserModel, WorkoutDay } from '../types/user';
import { AdaptiveEngine } from '../adaptiveEngine/AdaptiveEngine';
import { ExerciseCategory, TrainingSplitType, ProgressionLevel } from '../adaptiveEngine/types';


enum ExerciseDifficulty {
  Beginner = 'beginner',
  Intermediate = 'intermediate',
  Advanced = 'advanced'
}

/**
 * Enhanced workout plan generator with more intelligent defaults and personalization
 */
export const generateWorkoutPlan = (
  conversationState: ConversationState, 
  userGoal?: string, 
  userExperience?: string,
  user?: UserModel | null,              
  currentPlan?: WorkoutPlan | null,     
  feedbackHistory?: any[]               
): WorkoutPlan => {
  // Use adaptive engine for returning users with data
  if (user && (currentPlan || (user.dynamicAttributes?.workoutProgress?.completedExercises?.length || 0) > 10)) {
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
    }
  }
  
  // Extract user preferences and data
  const goals = userGoal || conversationState.fitnessGoals || 'general_health';
  const experience = userExperience || conversationState.experienceLevel || 'beginner';
  const location = conversationState.workoutLocation || 'both';
  const targetBodyAreas = conversationState.targetBodyAreas || [];
  const timeAvailable = conversationState.timeAvailable || 60; // Default: 60 minutes
  const preferredDaysPerWeek = conversationState.workoutFrequency || getDefaultFrequency(experience);
  const hasEquipment = location === 'gym' || (location === 'both' && Math.random() > 0.5);
  
  // Generate plan name and description
  const { planName, planDescription, focusAreas } = generatePlanBasics(
    goals, experience, location, targetBodyAreas, conversationState
  );
  
  // Determine optimal training frequency and split
  const daysPerWeek = determineDaysPerWeek(preferredDaysPerWeek, experience, goals);
  const trainingSplit = determineOptimalSplit(daysPerWeek, goals, experience);
  
  // Generate workout days with enhanced logic
  const days = generateWorkoutDays(
    daysPerWeek,
    trainingSplit,
    focusAreas,
    experience,
    location,
    targetBodyAreas,
    timeAvailable,
    conversationState.injuries || []
  );
  
  return {
    id: `plan_${Date.now()}`,
    name: planName,
    description: planDescription,
    createdAt: new Date().toISOString(),
    days,
    targetBodyAreas: targetBodyAreas.length > 0 ? targetBodyAreas : undefined
  };
};

/**
 * Get default weekly frequency based on experience level
 */
function getDefaultFrequency(experience: string): number {
  switch (experience) {
    case 'beginner': return 3;
    case 'intermediate': return 4;
    case 'advanced': return 5;
    default: return 3;
  }
}

/**
 * Generate plan basics (name, description, focus areas)
 */
function generatePlanBasics(
  goals: string, 
  experience: string, 
  location: string,
  targetBodyAreas: string[],
  conversationState: ConversationState
): { planName: string, planDescription: string, focusAreas: string[] } {
  let planName: string;
  let planDescription: string;
  let focusAreas: string[];
  
  switch (goals) {
    case 'fat_loss':
      planName = 'Fat Burning Plan';
      planDescription = 'High-intensity training focused on calorie burn and metabolic conditioning';
      focusAreas = ['HIIT Cardio', 'Core', 'Full Body', 'Active Recovery'];
      
      // Enhanced descriptions
      if (experience === 'beginner') {
        planDescription += ' with modified exercises suitable for beginners';
      } else if (experience === 'advanced') {
        planDescription += ' using complex movement patterns and minimal rest periods';
        focusAreas = ['HIIT Cardio', 'Metabolic Conditioning', 'Circuit Training', 'Active Recovery'];
      }
      break;
      
    case 'muscle_gain':
      planName = 'Muscle Building Plan';
      planDescription = 'Progressive overload training focused on hypertrophy and strength';
      
      // Different splits based on experience
      if (experience === 'beginner') {
        focusAreas = ['Full Body', 'Rest', 'Full Body', 'Rest', 'Full Body'];
      } else if (experience === 'intermediate') {
        focusAreas = ['Upper Body', 'Lower Body', 'Rest', 'Push', 'Pull', 'Legs', 'Rest'];
      } else {
        focusAreas = ['Push', 'Pull', 'Legs', 'Rest', 'Push', 'Pull', 'Legs'];
      }
      break;
      
    case 'endurance':
      planName = 'Endurance Training Plan';
      planDescription = 'Cardiovascular and muscular endurance to improve stamina';
      focusAreas = ['Long Duration Cardio', 'Tempo Training', 'Circuit Training', 'Recovery'];
      
      // Enhanced for more experienced athletes
      if (experience === 'advanced') {
        planDescription += ' with periodized intensity and specialized conditioning';
        focusAreas = ['Threshold Training', 'Interval Training', 'Endurance Circuits', 'Active Recovery'];
      }
      break;
      
    default: // general_health
      planName = 'Balanced Fitness Plan';
      planDescription = 'Comprehensive routine for overall health and wellness';
      
      if (experience === 'beginner') {
        focusAreas = ['Full Body', 'Cardio', 'Rest', 'Full Body', 'Flexibility', 'Rest', 'Light Activity'];
      } else {
        focusAreas = ['Cardio', 'Strength', 'Flexibility', 'Rest', 'Cardio', 'Strength', 'Active Recovery'];
      }
  }
  
  // Customize focus based on selected body areas
  if (targetBodyAreas && targetBodyAreas.length > 0) {
    // Map body areas to focus areas with more precise terminology
    const bodyAreaToFocus: Record<string, string> = {
      'chest': 'Chest & Triceps',
      'back': 'Back & Biceps',
      'shoulders': 'Shoulders & Traps',
      'arms': 'Arms & Forearms',
      'legs': 'Legs & Glutes',
      'core': 'Core & Abdominals',
      'cardio': 'Cardiovascular Training',
    };
    
    // Replace some focus areas with targeted body areas
    const customFocusAreas = targetBodyAreas.map(area => bodyAreaToFocus[area] || area);
    
    // Always keep at least one rest day for recovery
    if (!customFocusAreas.includes('Rest') && !customFocusAreas.includes('Active Recovery')) {
      customFocusAreas.push('Active Recovery');
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
    planDescription += ' (Modified to accommodate your specific needs and limitations)';
  }
  
  // Personalize the plan name based on who it's for
  if (conversationState.userName && conversationState.forWhom === 'self') {
    planName = `${conversationState.userName}'s ${planName}`;
  } else if (conversationState.forWhom !== 'self' && conversationState.forWhom) {
    planName = `${conversationState.forWhom}'s ${planName}`;
  }
  
  return { planName, planDescription, focusAreas };
}

/**
 * Determine optimal number of training days per week
 */
function determineDaysPerWeek(
  preferredDays: number, 
  experience: string, 
  goals: string
): number {
  // If user has a strong preference, respect it within reasonable bounds
  if (preferredDays) {
    // Cap based on experience level to prevent overtraining
    if (experience === 'beginner' && preferredDays > 4) {
      return 4; // Beginners shouldn't train more than 4 days/week
    }
    if (experience === 'intermediate' && preferredDays > 5) {
      return 5; // Intermediates capped at 5 days/week
    }
    return Math.min(Math.max(preferredDays, 2), 6); // Ensure between 2-6 days
  }
  
  // Default recommendations based on experience and goals
  if (goals === 'muscle_gain') {
    return experience === 'beginner' ? 3 : 
           experience === 'intermediate' ? 4 : 5;
  } else if (goals === 'fat_loss') {
    return experience === 'beginner' ? 4 : 
           experience === 'intermediate' ? 5 : 6;
  } else if (goals === 'endurance') {
    return experience === 'beginner' ? 4 : 
           experience === 'intermediate' ? 5 : 6;
  } else { // general_health
    return experience === 'beginner' ? 3 : 
           experience === 'intermediate' ? 4 : 5;
  }
}

/**
 * Determine optimal training split based on days per week
 */
function determineOptimalSplit(
  daysPerWeek: number,
  goals: string,
  experience: string
): TrainingSplitType {
  // For beginners, full body is generally best regardless of frequency
  if (experience === 'beginner') {
    return TrainingSplitType.FullBody;
  }
  
  // For muscle gain goal, use more specialized splits
  if (goals === 'muscle_gain') {
    if (daysPerWeek <= 3) {
      return TrainingSplitType.FullBody;
    } else if (daysPerWeek === 4) {
      return TrainingSplitType.UpperLower;
    } else {
      return TrainingSplitType.PushPullLegs;
    }
  }
  
  // For endurance or fat loss, full body circuits work well
  if (goals === 'endurance' || goals === 'fat_loss') {
    if (daysPerWeek <= 4) {
      return TrainingSplitType.FullBody;
    } else {
      // Even with higher frequency, alternating focus works well for these goals
      return TrainingSplitType.UpperLower;
    }
  }
  
  // General health default
  if (daysPerWeek <= 3) {
    return TrainingSplitType.FullBody;
  } else if (daysPerWeek === 4) {
    return TrainingSplitType.UpperLower;
  } else {
    return TrainingSplitType.BodyPart;
  }
}

/**
 * Generate workout days with enhanced exercise selection logic
 */
function generateWorkoutDays(
  daysPerWeek: number,
  trainingSplit: TrainingSplitType,
  focusAreas: string[],
  experience: string,
  location: string,
  targetBodyAreas: string[],
  timeAvailable: number,
  injuries: string[]
): WorkoutDay[] {
  const days: WorkoutDay[] = [];
  
  // Calculate exercise count based on time available
  // Average exercise takes ~5 minutes including rest
  const baseExerciseCount = Math.max(3, Math.min(8, Math.floor(timeAvailable / 5)));
  
  // Adjust for experience (beginners need fewer exercises to master form)
  const experienceMultiplier = experience === 'beginner' ? 0.8 : 
                             experience === 'intermediate' ? 1.0 : 1.2;
  
  // Create the workout days
  for (let i = 1; i <= daysPerWeek; i++) {
    // Determine focus for this day
    const dayFocusIndex = (i - 1) % focusAreas.length;
    const focus = focusAreas[dayFocusIndex];
    
    // Skip to next focus if it's a rest day
    if (focus.toLowerCase().includes('rest')) {
      days.push({
        dayNumber: i,
        focus,
        exercises: [
          {
            name: 'Complete Rest',
            intensity: 'None',
            notes: 'Take this day off from training to allow full recovery'
          }
        ]
      });
      continue;
    }
    
    // If active recovery day, use specific light exercises
    if (focus.toLowerCase().includes('recovery')) {
      days.push({
        dayNumber: i,
        focus,
        exercises: generateRecoveryDayExercises()
      });
      continue;
    }
    
    // Determine exercise count for this day
    // Adjust count based on focus (e.g., cardio days might have fewer exercises but longer duration)
    let exerciseCount = Math.round(baseExerciseCount * experienceMultiplier);
    if (focus.toLowerCase().includes('cardio')) {
      exerciseCount = Math.max(2, exerciseCount - 2);
    } else if (focus.toLowerCase().includes('full body')) {
      exerciseCount = Math.min(8, exerciseCount + 1);
    }
    
    // Generate exercises with enhanced selection logic
    const exercises = generateExercisesForDay(
      focus, 
      exerciseCount, 
      experience, 
      location, 
      trainingSplit,
      injuries
    );
    
    days.push({
      dayNumber: i,
      focus,
      exercises
    });
  }
  
  // Balance the overall program - ensure all major muscle groups are trained
  balanceWorkoutProgram(days, targetBodyAreas);
  
  return days;
}

/**
 * Generate active recovery day exercises
 */
function generateRecoveryDayExercises(): WorkoutExercise[] {
  return [
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
      notes: 'Focus on tight areas and trigger points'
    },
    {
      name: 'Mobility Work',
      duration: 15,
      intensity: 'Low',
      notes: 'Improve joint range of motion with dynamic movements'
    }
  ];
}

/**
 * Generate exercises for a specific workout day
 */
function generateExercisesForDay(
  focus: string,
  exerciseCount: number,
  experience: string,
  location: string,
  trainingSplit: TrainingSplitType,
  injuries: string[]
): WorkoutExercise[] {
  const exercises: WorkoutExercise[] = [];
  
  // For compound-focused days, ensure the first exercises are compounds
  const isCompoundFocusDay = focus.includes('Full Body') || 
                            focus.includes('Strength') || 
                            focus.includes('Push') || 
                            focus.includes('Pull') || 
                            focus.includes('Legs');
  
  // Get appropriate exercises for focus
  for (let i = 0; i < exerciseCount; i++) {
    let exercise: WorkoutExercise;
    
    // Prioritize compound movements at the beginning of the workout
    if (isCompoundFocusDay && i === 0) {
      exercise = getCompoundExerciseForFocus(focus, experience, location);
    } else {
      exercise = getExerciseForFocus(focus, location, experience);
    }
    
    // Check if exercise is suitable given injuries
    let attempts = 0;
    while (isExerciseContraindicatedForInjuries(exercise, injuries)) {
      if (attempts >= 10) {
        console.warn(`针对"${focus}"找不到适合伤病限制的练习，已尝试 ${attempts} 次，跳出循环`);
        break;
      }
      exercise = getExerciseForFocus(focus, location, experience);
      attempts++;
    }
    let duplicateAttempts = 0;
    // Ensure no duplicate exercises
    if (exercises.some(e => e.name === exercise.name)) {
      if (duplicateAttempts >= 5) {
        console.warn(`"${exercise.name}" 重复尝试超过 ${duplicateAttempts} 次，保留该练习`);
        break;
      }
      duplicateAttempts++;
    }
    
    exercises.push(exercise);
  }
  
  return exercises;
}

/**
 * Check if an exercise is contraindicated for specific injuries
 */
function isExerciseContraindicatedForInjuries(
  exercise: WorkoutExercise, 
  injuries: string[]
): boolean {
  if (injuries.length === 0) return false;
  
  // Map common injuries to contraindicated exercises
  const injuryExerciseMap: Record<string, string[]> = {
    'knee': ['Squat', 'Lunge', 'Jump', 'Run'],
    'back': ['Deadlift', 'Good Morning', 'Twist', 'Sit-up'],
    'shoulder': ['Overhead Press', 'Push-up', 'Bench Press', 'Pull-up'],
    'wrist': ['Push-up', 'Plank', 'Press', 'Curl'],
    'ankle': ['Run', 'Jump', 'Lunge', 'Calf Raise']
  };
  
  // Check if exercise contains any contraindicated movements
  for (const injury of injuries) {
    const lowercaseInjury = injury.toLowerCase();
    const contraindicatedMovements = Object.keys(injuryExerciseMap).find(
      key => lowercaseInjury.includes(key)
    );
    
    if (contraindicatedMovements) {
      const badExercises = injuryExerciseMap[contraindicatedMovements];
      if (badExercises.some(ex => exercise.name.includes(ex))) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Balance the overall workout program
 */
function balanceWorkoutProgram(
  days: WorkoutDay[], 
  targetBodyAreas: string[]
): void {
  // Skip if program is less than 3 days
  if (days.length < 3) return;
  
  // Track which body parts are covered
  const bodyPartsCovered = new Set<string>();
  
  // Map workout focuses to body parts
  const focusToBodyParts: Record<string, string[]> = {
    'Full Body': ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'],
    'Upper Body': ['Chest', 'Back', 'Shoulders', 'Arms'],
    'Lower Body': ['Legs', 'Glutes', 'Calves'],
    'Push': ['Chest', 'Shoulders', 'Triceps'],
    'Pull': ['Back', 'Biceps', 'Rear Delts'],
    'Legs': ['Quads', 'Hamstrings', 'Glutes', 'Calves'],
    'Core': ['Abs', 'Obliques', 'Lower Back']
  };
  
  // Check each day's focus
  for (const day of days) {
    if (day.focus.toLowerCase().includes('rest') || 
        day.focus.toLowerCase().includes('recovery')) {
      continue;
    }
    
    // Add covered body parts
    Object.entries(focusToBodyParts).forEach(([key, parts]) => {
      if (day.focus.includes(key)) {
        parts.forEach(part => bodyPartsCovered.add(part));
      }
    });
    
    // Check individual exercises too
    for (const exercise of day.exercises) {
      if (exercise.name.includes('Chest') || exercise.name.includes('Bench')) {
        bodyPartsCovered.add('Chest');
      } else if (exercise.name.includes('Back') || exercise.name.includes('Row')) {
        bodyPartsCovered.add('Back');
      }
      // Continue for other body parts
    }
  }
  
  // Check if major body parts are missing and should be covered
  const essentialBodyParts = ['Chest', 'Back', 'Legs', 'Shoulders', 'Core'];
  const missingBodyParts = essentialBodyParts.filter(part => !bodyPartsCovered.has(part));
  
  // Only add missing parts that aren't explicitly excluded in targetBodyAreas
  const targetBodyPartsLower = targetBodyAreas.map(area => area.toLowerCase());
  const partsToAdd = missingBodyParts.filter(part => {
    return targetBodyAreas.length === 0 || 
           targetBodyPartsLower.includes(part.toLowerCase());
  });
  
  // If essential body parts are missing, modify a day to include them
  if (partsToAdd.length > 0) {
    // Find a suitable day to modify (preferably not the last day)
    const dayToModify = days.find(day => 
      !day.focus.toLowerCase().includes('rest') && 
      !day.focus.toLowerCase().includes('recovery')
    );
    
    if (dayToModify && dayToModify.exercises.length > 0) {
      // Add one exercise for each missing major body part
      partsToAdd.forEach(part => {
        const exercise = getExerciseForBodyPart(part);
        
        // Replace the last exercise or add if room
        if (dayToModify.exercises.length >= 6) {
          dayToModify.exercises[dayToModify.exercises.length - 1] = exercise;
        } else {
          dayToModify.exercises.push(exercise);
        }
      });
    }
  }
}

/**
 * Get exercise for specific body part
 */
function getExerciseForBodyPart(bodyPart: string): WorkoutExercise {
  // Default exercises for major body parts
  switch (bodyPart) {
    case 'Chest':
      return {
        name: 'Push-Ups',
        sets: 3,
        reps: 12,
        restTime: 60,
        intensity: 'Medium'
      };
    case 'Back':
      return {
        name: 'Resistance Band Rows',
        sets: 3,
        reps: 12,
        restTime: 60,
        intensity: 'Medium'
      };
    case 'Legs':
      return {
        name: 'Bodyweight Squats',
        sets: 3,
        reps: 15,
        restTime: 60,
        intensity: 'Medium'
      };
    case 'Shoulders':
      return {
        name: 'Lateral Raises',
        sets: 3,
        reps: 12,
        restTime: 45,
        intensity: 'Medium'
      };
    case 'Core':
      return {
        name: 'Plank',
        sets: 3,
        duration: 30,
        restTime: 45,
        intensity: 'Medium'
      };
    default:
      return {
        name: 'Bodyweight Exercise',
        sets: 3,
        reps: 12,
        restTime: 60,
        intensity: 'Medium'
      };
  }
}

/**
 * Get compound exercise for a specific focus
 */
function getCompoundExerciseForFocus(
  focus: string, 
  experience: string, 
  location: string
): WorkoutExercise {
  // Major compound movements organized by focus area
  const compoundExercises: Record<string, WorkoutExercise[]> = {
    'Upper Body': [
      { name: 'Bench Press', sets: 4, reps: 8, restTime: 90, intensity: 'High' },
      { name: 'Pull-Ups', sets: 3, reps: 8, restTime: 90, intensity: 'High' },
      { name: 'Push-Ups', sets: 3, reps: 12, restTime: 60, intensity: 'Medium' }
    ],
    'Lower Body': [
      { name: 'Barbell Squats', sets: 4, reps: 8, restTime: 120, intensity: 'High' },
      { name: 'Deadlifts', sets: 4, reps: 6, restTime: 120, intensity: 'High' },
      { name: 'Walking Lunges', sets: 3, reps: 20, restTime: 60, intensity: 'Medium' }
    ],
    'Push': [
      { name: 'Overhead Press', sets: 4, reps: 8, restTime: 90, intensity: 'High' },
      { name: 'Incline Bench Press', sets: 4, reps: 8, restTime: 90, intensity: 'High' },
      { name: 'Dips', sets: 3, reps: 10, restTime: 60, intensity: 'Medium' }
    ],
    'Pull': [
      { name: 'Bent-Over Rows', sets: 4, reps: 8, restTime: 90, intensity: 'High' },
      { name: 'Chin-Ups', sets: 3, reps: 8, restTime: 90, intensity: 'High' },
      { name: 'Face Pulls', sets: 3, reps: 12, restTime: 60, intensity: 'Medium' }
    ],
    'Legs': [
      { name: 'Romanian Deadlifts', sets: 4, reps: 8, restTime: 90, intensity: 'High' },
      { name: 'Front Squats', sets: 4, reps: 8, restTime: 90, intensity: 'High' },
      { name: 'Bulgarian Split Squats', sets: 3, reps: 10, restTime: 60, intensity: 'Medium' }
    ],
    'Full Body': [
      { name: 'Barbell Squat Clean', sets: 4, reps: 6, restTime: 90, intensity: 'High' },
      { name: 'Turkish Get-Ups', sets: 3, reps: 5, restTime: 90, intensity: 'High' },
      { name: 'Thrusters', sets: 3, reps: 10, restTime: 90, intensity: 'High' }
    ]
  };
  
  // If home workout, use bodyweight alternatives
  if (location === 'home') {
    const homeCompounds: Record<string, WorkoutExercise[]> = {
      'Upper Body': [
        { name: 'Push-Ups', sets: 3, reps: 12, restTime: 60, intensity: 'Medium' },
        { name: 'Pike Push-Ups', sets: 3, reps: 8, restTime: 60, intensity: 'Medium' },
        { name: 'Pull-Ups (if pull-up bar available)', sets: 3, reps: 8, restTime: 60, intensity: 'Medium' }
      ],
      'Lower Body': [
        { name: 'Bulgarian Split Squats', sets: 3, reps: 10, restTime: 60, intensity: 'Medium' },
        { name: 'Single-Leg Romanian Deadlifts', sets: 3, reps: 10, restTime: 60, intensity: 'Medium' },
        { name: 'Jump Squats', sets: 3, reps: 15, restTime: 45, intensity: 'Medium' }
      ],
      'Full Body': [
        { name: 'Burpees', sets: 3, reps: 12, restTime: 60, intensity: 'High' },
        { name: 'Mountain Climbers', sets: 3, reps: 20, restTime: 45, intensity: 'Medium' },
        { name: 'Inchworms', sets: 3, reps: 10, restTime: 60, intensity: 'Medium' }
      ]
    };
    
    // Use home compounds if available for this focus, otherwise default to regular
    if (homeCompounds[focus]) {
      compoundExercises[focus] = homeCompounds[focus];
    }
  }
  
  // Get compounds for this focus, or default to a general category
  let availableCompounds = compoundExercises[focus];
  if (!availableCompounds) {
    // If no direct match, look for partial matches
    const focusKey = Object.keys(compoundExercises).find(key => focus.includes(key));
    availableCompounds = focusKey ? compoundExercises[focusKey] : compoundExercises['Full Body'];
  }
  
  // Adjust difficulty based on experience
  const selectedExercise = availableCompounds[Math.floor(Math.random() * availableCompounds.length)];
  
  if (experience === 'beginner') {
    selectedExercise.sets = Math.max(2, (selectedExercise.sets || 3) - 1);
    selectedExercise.reps = Math.min(15, (selectedExercise.reps || 8) + 4);
    selectedExercise.intensity = 'Medium-Low';
  } else if (experience === 'advanced') {
    selectedExercise.sets = Math.min(5, (selectedExercise.sets || 3) + 1);
    selectedExercise.intensity = 'High';
  }
  
  return selectedExercise;
}

/**
 * Enhanced exercise selection for a specific focus
 * More intelligent exercise selection based on experience, body part, and goals
 */
export const getExerciseForFocus = (
  focus: string, 
  location: string = 'both',
  experience: string = 'intermediate'
): WorkoutExercise => {
  // Enhanced exercise database with difficulty ratings and categories
  const exerciseDatabase: Record<string, Record<string, Array<WorkoutExercise & { difficulty: ExerciseDifficulty, category: ExerciseCategory }>>> =  {
    // Home exercises
    'home': {
      'HIIT Cardio': [
        { name: 'Burpees', sets: 3, reps: 12, restTime: 30, intensity: 'High', difficulty: ExerciseDifficulty.Intermediate, category: ExerciseCategory.Cardio },
        { name: 'Mountain Climbers', sets: 3, reps: 20, restTime: 30, intensity: 'High', difficulty: ExerciseDifficulty.Beginner, category: ExerciseCategory.Cardio },
        { name: 'Jump Squats', sets: 3, reps: 15, restTime: 30, intensity: 'High', difficulty: ExerciseDifficulty.Intermediate, category: ExerciseCategory.Cardio },
        { name: 'High Knees', sets: 4, reps: 20, restTime: 20, intensity: 'High', difficulty: ExerciseDifficulty.Beginner, category: ExerciseCategory.Cardio },
        { name: 'Jumping Jacks', sets: 4, reps: 25, restTime: 20, intensity: 'Medium', difficulty: ExerciseDifficulty.Beginner, category: ExerciseCategory.Cardio },
        { name: 'Skater Jumps', sets: 3, reps: 16, restTime: 30, intensity: 'High', difficulty: ExerciseDifficulty.Intermediate, category: ExerciseCategory.Cardio }
      ],
      'Core': [
        { name: 'Plank', sets: 3, duration: 45, restTime: 45, intensity: 'Medium', difficulty: ExerciseDifficulty.Beginner, category: ExerciseCategory.Strength },
        { name: 'Russian Twists', sets: 3, reps: 20, restTime: 45, intensity: 'Medium', difficulty: ExerciseDifficulty.Beginner, category: ExerciseCategory.Strength },
        { name: 'Leg Raises', sets: 3, reps: 12, restTime: 45, intensity: 'Medium', difficulty: ExerciseDifficulty.Intermediate, category: ExerciseCategory.Strength },
        { name: 'Bicycle Crunches', sets: 3, reps: 16, restTime: 40, intensity: 'Medium', difficulty: ExerciseDifficulty.Beginner, category: ExerciseCategory.Strength },
        { name: 'V-Ups', sets: 3, reps: 12, restTime: 45, intensity: 'High', difficulty: ExerciseDifficulty.Advanced, category: ExerciseCategory.Strength },
        { name: 'Side Planks', sets: 2, duration: 30, restTime: 30, intensity: 'Medium', difficulty: ExerciseDifficulty.Intermediate, category: ExerciseCategory.Strength }
      ],
      'Upper Body': [
        { name: 'Push-Ups', sets: 3, reps: 12, restTime: 60, intensity: 'Medium', difficulty: ExerciseDifficulty.Intermediate, category: ExerciseCategory.Strength },
        { name: 'Pike Push-Ups', sets: 3, reps: 10, restTime: 60, intensity: 'Medium', difficulty: ExerciseDifficulty.Intermediate, category: ExerciseCategory.Strength },
        { name: 'Door Frame Rows', sets: 3, reps: 12, restTime: 60, intensity: 'Medium', difficulty: ExerciseDifficulty.Beginner, category: ExerciseCategory.Strength },
        { name: 'Incline Push-Ups', sets: 3, reps: 15, restTime: 45, intensity: 'Low', difficulty: ExerciseDifficulty.Beginner, category: ExerciseCategory.Strength },
        { name: 'Diamond Push-Ups', sets: 3, reps: 10, restTime: 60, intensity: 'High', difficulty: ExerciseDifficulty.Advanced, category: ExerciseCategory.Strength },
        { name: 'Seated Dips', sets: 3, reps: 12, restTime: 60, intensity: 'Medium', difficulty: ExerciseDifficulty.Intermediate, category: ExerciseCategory.Strength }
      ],
      'Lower Body': [
        { name: 'Bodyweight Squats', sets: 3, reps: 15, restTime: 60, intensity: 'Medium', difficulty: ExerciseDifficulty.Beginner, category: ExerciseCategory.Strength },
        { name: 'Lunges', sets: 3, reps: 12, restTime: 60, intensity: 'Medium', difficulty: ExerciseDifficulty.Beginner, category: ExerciseCategory.Strength },
        { name: 'Glute Bridges', sets: 3, reps: 15, restTime: 45, intensity: 'Medium', difficulty: ExerciseDifficulty.Beginner, category: ExerciseCategory.Strength },
        { name: 'Bulgarian Split Squats', sets: 3, reps: 10, restTime: 60, intensity: 'High', difficulty: ExerciseDifficulty.Advanced, category: ExerciseCategory.Strength },
        { name: 'Single-Leg Glute Bridges', sets: 3, reps: 12, restTime: 45, intensity: 'Medium', difficulty: ExerciseDifficulty.Intermediate, category: ExerciseCategory.Strength },
        { name: 'Pistol Squats', sets: 3, reps: 8, restTime: 60, intensity: 'High', difficulty: ExerciseDifficulty.Advanced, category: ExerciseCategory.Strength }
      ],
      'Cardio': [
        { name: 'High Knees', sets: 3, duration: 60, restTime: 30, intensity: 'Medium', difficulty: ExerciseDifficulty.Beginner, category: ExerciseCategory.Cardio },
        { name: 'Jumping Jacks', sets: 3, duration: 60, restTime: 30, intensity: 'Medium', difficulty: ExerciseDifficulty.Beginner, category: ExerciseCategory.Cardio },
        { name: 'Stair Climbing', duration: 15, intensity: 'Medium', difficulty: ExerciseDifficulty.Beginner, category: ExerciseCategory.Cardio },
        { name: 'Jump Rope', duration: 10, intensity: 'Medium', difficulty: ExerciseDifficulty.Intermediate, category: ExerciseCategory.Cardio },
        { name: 'Tabata Intervals', sets: 8, duration: 20, restTime: 10, intensity: 'High', difficulty: ExerciseDifficulty.Advanced, category: ExerciseCategory.Cardio },
        { name: 'Shadowboxing', duration: 10, intensity: 'Medium', difficulty: ExerciseDifficulty.Intermediate, category: ExerciseCategory.Cardio }
      ],
      'Full Body': [
        { name: 'Inchworm', sets: 3, reps: 10, restTime: 45, intensity: 'Medium', difficulty: ExerciseDifficulty.Intermediate, category: ExerciseCategory.Strength },
        { name: 'Star Jumps', sets: 3, reps: 15, restTime: 30, intensity: 'Medium', difficulty: ExerciseDifficulty.Beginner, category: ExerciseCategory.Cardio },
        { name: 'Bodyweight Circuit', sets: 2, duration: 300, restTime: 60, intensity: 'High', difficulty: ExerciseDifficulty.Intermediate, category: ExerciseCategory.Cardio },
        { name: 'Burpees', sets: 3, reps: 12, restTime: 45, intensity: 'High', difficulty: ExerciseDifficulty.Intermediate, category: ExerciseCategory.Cardio },
        { name: 'Bear Crawls', sets: 3, duration: 30, restTime: 45, intensity: 'Medium', difficulty: ExerciseDifficulty.Intermediate, category: ExerciseCategory.Strength },
        { name: 'Hindu Push-Ups', sets: 3, reps: 12, restTime: 45, intensity: 'High', difficulty: ExerciseDifficulty.Advanced, category: ExerciseCategory.Strength }
      ],
      'Strength': [
        { name: 'Resistance Band Rows', sets: 3, reps: 12, restTime: 60, intensity: 'Medium', difficulty: ExerciseDifficulty.Beginner, category: ExerciseCategory.Strength },
        { name: 'Resistance Band Chest Press', sets: 3, reps: 12, restTime: 60, intensity: 'Medium', difficulty: ExerciseDifficulty.Beginner, category: ExerciseCategory.Strength },
        { name: 'Wall Sits', sets: 3, duration: 45, restTime: 45, intensity: 'Medium', difficulty: ExerciseDifficulty.Beginner, category: ExerciseCategory.Strength },
        { name: 'Resistance Band Lateral Raises', sets: 3, reps: 15, restTime: 45, intensity: 'Medium', difficulty: ExerciseDifficulty.Beginner, category: ExerciseCategory.Strength },
        { name: 'Resistance Band Bicep Curls', sets: 3, reps: 15, restTime: 45, intensity: 'Medium', difficulty: ExerciseDifficulty.Beginner, category: ExerciseCategory.Strength },
        { name: 'Resistance Band Overhead Press', sets: 3, reps: 12, restTime: 60, intensity: 'Medium', difficulty: ExerciseDifficulty.Intermediate, category: ExerciseCategory.Strength }
      ],
      'Flexibility': [
        { name: 'Yoga Flow', duration: 20, intensity: 'Low', difficulty: ExerciseDifficulty.Beginner, category: ExerciseCategory.Flexibility },
        { name: 'Dynamic Stretching', duration: 15, intensity: 'Low', difficulty: ExerciseDifficulty.Beginner, category: ExerciseCategory.Flexibility },
        { name: 'Static Stretching', duration: 15, intensity: 'Low', difficulty: ExerciseDifficulty.Beginner, category: ExerciseCategory.Flexibility },
        { name: 'Sun Salutations', sets: 3, reps: 5, intensity: 'Low', difficulty: ExerciseDifficulty.Beginner, category: ExerciseCategory.Flexibility },
        { name: 'PNF Stretching', duration: 15, intensity: 'Medium', difficulty: ExerciseDifficulty.Intermediate, category: ExerciseCategory.Flexibility },
        { name: 'Mobility Routine', duration: 20, intensity: 'Low', difficulty: ExerciseDifficulty.Intermediate, category: ExerciseCategory.Flexibility }
      ],
      'Rest': [
        { name: 'Active Recovery - Light Walking', duration: 20, intensity: 'Low', difficulty: ExerciseDifficulty.Beginner, category: ExerciseCategory.Flexibility },
        { name: 'Stretching Session', duration: 20, intensity: 'Low', difficulty: ExerciseDifficulty.Beginner, category: ExerciseCategory.Flexibility },
        { name: 'Rest Day', intensity: 'None', notes: 'Take time to recover properly', difficulty: ExerciseDifficulty.Beginner, category: ExerciseCategory.Flexibility }
      ]
    },
    
    // Gym exercises
    'gym': {
      'HIIT Cardio': [
        { name: 'Treadmill Sprints', sets: 5, duration: 30, restTime: 60, intensity: 'High', difficulty: ExerciseDifficulty.Intermediate, category: ExerciseCategory.Cardio },
        { name: 'Battle Ropes', sets: 3, duration: 30, restTime: 45, intensity: 'High', difficulty: ExerciseDifficulty.Intermediate, category: ExerciseCategory.Cardio },
        { name: 'Box Jumps', sets: 4, reps: 10, restTime: 60, intensity: 'High', difficulty: ExerciseDifficulty.Intermediate, category: ExerciseCategory.Power },
        { name: 'Assault Bike', sets: 4, duration: 30, restTime: 60, intensity: 'High', difficulty: ExerciseDifficulty.Intermediate, category: ExerciseCategory.Cardio },
        { name: 'Kettlebell Swings', sets: 4, reps: 15, restTime: 45, intensity: 'High', difficulty: ExerciseDifficulty.Intermediate, category: ExerciseCategory.Power },
        { name: 'Medicine Ball Slams', sets: 3, reps: 15, restTime: 45, intensity: 'High', difficulty: ExerciseDifficulty.Intermediate, category: ExerciseCategory.Power }
      ],
      'Core': [
        { name: 'Cable Crunches', sets: 3, reps: 15, restTime: 45, intensity: 'Medium', difficulty: ExerciseDifficulty.Intermediate, category: ExerciseCategory.Strength },
        { name: 'Hanging Leg Raises', sets: 3, reps: 12, restTime: 60, intensity: 'High', difficulty: ExerciseDifficulty.Advanced, category: ExerciseCategory.Strength },
        { name: 'Ab Rollouts', sets: 3, reps: 10, restTime: 60, intensity: 'High', difficulty: ExerciseDifficulty.Advanced, category: ExerciseCategory.Strength },
        { name: 'Weighted Russian Twists', sets: 3, reps: 20, restTime: 45, intensity: 'Medium', difficulty: ExerciseDifficulty.Intermediate, category: ExerciseCategory.Strength },
        { name: 'Cable Woodchoppers', sets: 3, reps: 12, restTime: 45, intensity: 'Medium', difficulty: ExerciseDifficulty.Intermediate, category: ExerciseCategory.Strength },
        { name: 'Landmine Rotations', sets: 3, reps: 10, restTime: 45, intensity: 'Medium', difficulty: ExerciseDifficulty.Advanced, category: ExerciseCategory.Strength }
      ],
      'Upper Body': [
        { name: 'Bench Press', sets: 4, reps: 10, restTime: 90, intensity: 'High', difficulty: ExerciseDifficulty.Intermediate, category: ExerciseCategory.Strength },
        { name: 'Lat Pulldown', sets: 4, reps: 12, restTime: 90, intensity: 'Medium', difficulty: ExerciseDifficulty.Beginner, category: ExerciseCategory.Strength },
        { name: 'Shoulder Press', sets: 3, reps: 10, restTime: 90, intensity: 'Medium', difficulty: ExerciseDifficulty.Intermediate, category: ExerciseCategory.Strength },
        { name: 'Cable Flyes', sets: 3, reps: 12, restTime: 60, intensity: 'Medium', difficulty: ExerciseDifficulty.Beginner, category: ExerciseCategory.Strength },
        { name: 'Face Pulls', sets: 3, reps: 15, restTime: 60, intensity: 'Medium', difficulty: ExerciseDifficulty.Beginner, category: ExerciseCategory.Strength },
        { name: 'Incline Dumbbell Press', sets: 3, reps: 10, restTime: 75, intensity: 'Medium', difficulty: ExerciseDifficulty.Intermediate, category: ExerciseCategory.Strength }
      ],
      'Lower Body': [
        { name: 'Barbell Squats', sets: 4, reps: 8, restTime: 120, intensity: 'High', difficulty: ExerciseDifficulty.Intermediate, category: ExerciseCategory.Strength },
        { name: 'Leg Press', sets: 3, reps: 12, restTime: 90, intensity: 'Medium', difficulty: ExerciseDifficulty.Beginner, category: ExerciseCategory.Strength },
        { name: 'Hamstring Curls', sets: 3, reps: 12, restTime: 60, intensity: 'Medium', difficulty: ExerciseDifficulty.Beginner, category: ExerciseCategory.Strength },
        { name: 'Romanian Deadlifts', sets: 3, reps: 10, restTime: 90, intensity: 'High', difficulty: ExerciseDifficulty.Intermediate, category: ExerciseCategory.Strength },
        { name: 'Leg Extensions', sets: 3, reps: 15, restTime: 60, intensity: 'Medium', difficulty: ExerciseDifficulty.Beginner, category: ExerciseCategory.Strength },
        { name: 'Walking Lunges', sets: 3, reps: 20, restTime: 60, intensity: 'Medium', difficulty: ExerciseDifficulty.Intermediate, category: ExerciseCategory.Strength }
      ],
      'Push': [
        { name: 'Incline Bench Press', sets: 3, reps: 10, restTime: 90, intensity: 'Medium', difficulty: ExerciseDifficulty.Intermediate, category: ExerciseCategory.Strength },
        { name: 'Dumbbell Shoulder Press', sets: 3, reps: 10, restTime: 90, intensity: 'Medium', difficulty: ExerciseDifficulty.Intermediate, category: ExerciseCategory.Strength },
        { name: 'Tricep Pushdown', sets: 3, reps: 12, restTime: 60, intensity: 'Medium', difficulty: ExerciseDifficulty.Beginner, category: ExerciseCategory.Strength },
        { name: 'Chest Flyes', sets: 3, reps: 12, restTime: 60, intensity: 'Medium', difficulty: ExerciseDifficulty.Beginner, category: ExerciseCategory.Strength },
        { name: 'Lateral Raises', sets: 3, reps: 15, restTime: 60, intensity: 'Medium', difficulty: ExerciseDifficulty.Beginner, category: ExerciseCategory.Strength },
        { name: 'Cable Tricep Extensions', sets: 3, reps: 12, restTime: 60, intensity: 'Medium', difficulty: ExerciseDifficulty.Beginner, category: ExerciseCategory.Strength }
      ],
      'Pull': [
        { name: 'Barbell Rows', sets: 3, reps: 10, restTime: 90, intensity: 'Medium', difficulty: ExerciseDifficulty.Intermediate, category: ExerciseCategory.Strength },
        { name: 'Pull-Ups', sets: 3, reps: 8, restTime: 90, intensity: 'Medium', difficulty: ExerciseDifficulty.Advanced, category: ExerciseCategory.Strength },
        { name: 'Bicep Curls', sets: 3, reps: 12, restTime: 60, intensity: 'Medium', difficulty: ExerciseDifficulty.Beginner, category: ExerciseCategory.Strength },
        { name: 'Seated Cable Rows', sets: 3, reps: 12, restTime: 60, intensity: 'Medium', difficulty: ExerciseDifficulty.Beginner, category: ExerciseCategory.Strength },
        { name: 'Face Pulls', sets: 3, reps: 15, restTime: 60, intensity: 'Low', difficulty: ExerciseDifficulty.Beginner, category: ExerciseCategory.Strength },
        { name: 'Hammer Curls', sets: 3, reps: 12, restTime: 60, intensity: 'Medium', difficulty: ExerciseDifficulty.Beginner, category: ExerciseCategory.Strength }
      ],
      'Legs': [
        { name: 'Deadlifts', sets: 4, reps: 8, restTime: 120, intensity: 'High', difficulty: ExerciseDifficulty.Advanced, category: ExerciseCategory.Strength },
        { name: 'Leg Extensions', sets: 3, reps: 12, restTime: 60, intensity: 'Medium', difficulty: ExerciseDifficulty.Beginner, category: ExerciseCategory.Strength },
        { name: 'Calf Raises', sets: 4, reps: 15, restTime: 45, intensity: 'Medium', difficulty: ExerciseDifficulty.Beginner, category: ExerciseCategory.Strength },
        { name: 'Hack Squats', sets: 3, reps: 10, restTime: 90, intensity: 'High', difficulty: ExerciseDifficulty.Intermediate, category: ExerciseCategory.Strength },
        { name: 'Glute Ham Raises', sets: 3, reps: 12, restTime: 60, intensity: 'High', difficulty: ExerciseDifficulty.Advanced, category: ExerciseCategory.Strength },
        { name: 'Leg Press Calf Raises', sets: 3, reps: 20, restTime: 45, intensity: 'Medium', difficulty: ExerciseDifficulty.Beginner, category: ExerciseCategory.Strength }
      ],
      'Cardio': [
        { name: 'Stairmaster', duration: 20, intensity: 'Medium', difficulty: ExerciseDifficulty.Beginner, category: ExerciseCategory.Cardio },
        { name: 'Rowing Machine', duration: 15, intensity: 'Medium', difficulty: ExerciseDifficulty.Beginner, category: ExerciseCategory.Cardio },
        { name: 'Elliptical Trainer', duration: 25, intensity: 'Medium', difficulty: ExerciseDifficulty.Beginner, category: ExerciseCategory.Cardio },
        { name: 'Spin Bike Intervals', sets: 5, duration: 60, restTime: 60, intensity: 'High', difficulty: ExerciseDifficulty.Intermediate, category: ExerciseCategory.Cardio },
        { name: 'Treadmill Incline Walk', duration: 20, intensity: 'Medium', difficulty: ExerciseDifficulty.Beginner, category: ExerciseCategory.Cardio },
        { name: 'HIIT Circuit', sets: 3, duration: 120, restTime: 60, intensity: 'High', difficulty: ExerciseDifficulty.Advanced, category: ExerciseCategory.Cardio }
      ],
      'Rest': [
        { name: 'Active Recovery - Light Cardio', duration: 20, intensity: 'Low', difficulty: ExerciseDifficulty.Beginner, category: ExerciseCategory.Cardio },
        { name: 'Stretching Session', duration: 20, intensity: 'Low', difficulty: ExerciseDifficulty.Beginner, category: ExerciseCategory.Flexibility },
        { name: 'Rest Day', intensity: 'None', notes: 'Take time to recover properly', difficulty: ExerciseDifficulty.Beginner, category: ExerciseCategory.Flexibility }
      ]
    }
  };
  
  // Determine which exercise database to use based on location
  let exerciseLocation: string;
  if (location === 'home') {
    exerciseLocation = 'home';
  } else if (location === 'gym') {
    exerciseLocation = 'gym';
  } else {
    // If 'both' or unspecified, randomly choose
    exerciseLocation = Math.random() > 0.5 ? 'gym' : 'home';
  }
  
  // Find available exercises for the given focus
  let availableExercises = exerciseDatabase[exerciseLocation][focus];
  
  // If no direct match, look for partial matches
  if (!availableExercises) {
    const focusKeys = Object.keys(exerciseDatabase[exerciseLocation]);
    const matchingKey = focusKeys.find(key => focus.includes(key) || key.includes(focus));
    
    if (matchingKey) {
      availableExercises = exerciseDatabase[exerciseLocation][matchingKey];
    } else {
      // Fallback to cardio or full body
      availableExercises = exerciseDatabase[exerciseLocation]['Cardio'] || 
                         exerciseDatabase[exerciseLocation]['Full Body'];
    }
  }
  
  // Filter exercises based on experience level
  const experienceLevelMap: Record<string, ExerciseDifficulty> = {
    'beginner': ExerciseDifficulty.Beginner,
    'intermediate': ExerciseDifficulty.Intermediate,
    'advanced': ExerciseDifficulty.Advanced
  };
  
  const userDifficulty = experienceLevelMap[experience] || ExerciseDifficulty.Intermediate;
  
  // Find exercises appropriate for user's level
  // Beginner gets beginner exercises
  // Intermediate gets beginner + intermediate exercises
  // Advanced gets all exercises
  const suitableExercises = availableExercises.filter(exercise => {
    if (userDifficulty === ExerciseDifficulty.Beginner) {
      return exercise.difficulty === ExerciseDifficulty.Beginner;
    } else if (userDifficulty === ExerciseDifficulty.Intermediate) {
      return exercise.difficulty !== ExerciseDifficulty.Advanced;
    } else {
      return true; // Advanced users can do any exercise
    }
  });
  
  // If no suitable exercises found, use the full list (shouldn't happen with good data)
  const exercisePool = suitableExercises.length > 0 ? suitableExercises : availableExercises;
  
  // Select a random exercise from the filtered list
  const selectedExercise = exercisePool[Math.floor(Math.random() * exercisePool.length)];
  
  // Remove the difficulty and category fields before returning (they're not part of the WorkoutExercise type)
  const { difficulty, category, ...returnExercise } = selectedExercise;
  
  return returnExercise;
};

/**
 * Export module for use in other parts of the application
 */
export default {
  generateWorkoutPlan,
  getExerciseForFocus,
  getCompoundExerciseForFocus,
  determineOptimalSplit,
  determineDaysPerWeek
};