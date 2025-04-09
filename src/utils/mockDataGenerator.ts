// src/utils/mockDataGenerator.ts
import { UserFeedback } from '@/adaptiveEngine/types';
import { WorkoutPlan } from '@/types/user';

// Generate simulated user history data
export function generateMockUserJourney(
  weeks: number, 
  exercisesPerWeek: number,
  startingDifficulty: number = 3,
  learningRate: number = 0.2
): UserFeedback[] {
  const feedbackHistory: UserFeedback[] = [];
  const now = new Date();
  
  // Set initial ability level
  let userAbility = 2.0; // User starts at a lower ability level
  let userConsistency = 0.8; // User consistency will fluctuate randomly
  let currentWeekDay = 0;
  
  // Generate feedback for each week
  for (let week = 0; week < weeks; week++) {
    // User ability improves over time
    userAbility += learningRate;
    if (userAbility > 4.5) userAbility = 4.5; // Cap maximum ability
    
    // User consistency fluctuates slightly each week
    userConsistency = Math.max(0.5, Math.min(1.0, userConsistency + (Math.random() * 0.4 - 0.2)));
    
    // Simulate training for this week
    for (let e = 0; e < exercisesPerWeek; e++) {
      // Calculate date
      const timestamp = new Date(now);
      timestamp.setDate(now.getDate() - ((weeks - week) * 7) + currentWeekDay);
      currentWeekDay = (currentWeekDay + 1) % 7;
      
      // Calculate random variation
      const dayVariation = Math.random() * 0.8 - 0.4; // Random daily performance variation
      
      // Perceived difficulty depends on difference between user ability and exercise difficulty
      const perceivedDifficulty = Math.max(1, Math.min(5, 
        startingDifficulty + dayVariation - (userAbility - 2) + (week === 0 ? 1 : 0)
      ));
      
      // Fatigue related to difficulty and consistency
      const fatigue = Math.max(1, Math.min(5, 
        perceivedDifficulty + (1 - userConsistency) * 2 + dayVariation
      ));
      
      // Enjoyment inversely related to difficulty, but also depends on sense of progress
      const enjoyment = Math.max(1, Math.min(5, 
        (5 - perceivedDifficulty) * 0.7 + userConsistency * 1.5 + dayVariation + (week > 0 ? 0.5 : 0)
      ));
      
      // Add simulated feedback
      feedbackHistory.push({
        exerciseId: `${(currentWeekDay % 7) + 1}-${e % 3}`,
        difficulty: Math.round(perceivedDifficulty * 10) / 10,
        fatigue: Math.round(fatigue * 10) / 10,
        enjoyment: Math.round(enjoyment * 10) / 10,
        completionTime: Math.round(60 + perceivedDifficulty * 15 + dayVariation * 20),
        notes: "",
        timestamp: timestamp.toISOString()
      });
    }
  }
  
  return feedbackHistory;
}

// Generate system's adaptive responses to feedback
export function generateAdaptiveResponses(
  initialPlan: WorkoutPlan, 
  feedbackHistory: UserFeedback[]
): { week: number; plan: WorkoutPlan; insights: any }[] {
  // Track weekly adjustments
  const weeklyPlans: { week: number; plan: WorkoutPlan; insights: any }[] = [];
  
  // Group feedback by week
  const weeklyFeedback: UserFeedback[][] = [];
  let currentWeekFeedback: UserFeedback[] = [];
  let currentWeekTimestamp: Date | null = null;
  
  // Organize feedback by week
  feedbackHistory.sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  ).forEach(feedback => {
    const timestamp = new Date(feedback.timestamp);
    
    if (!currentWeekTimestamp) {
      currentWeekTimestamp = timestamp;
      currentWeekFeedback.push(feedback);
    } else {
      // Check if this is a new week
      const diffDays = Math.floor((timestamp.getTime() - currentWeekTimestamp.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays >= 7) {
        // New week
        weeklyFeedback.push([...currentWeekFeedback]);
        currentWeekFeedback = [feedback];
        currentWeekTimestamp = timestamp;
      } else {
        // Same week
        currentWeekFeedback.push(feedback);
      }
    }
  });
  
  // Add the last week
  if (currentWeekFeedback.length > 0) {
    weeklyFeedback.push(currentWeekFeedback);
  }
  
  // Simulate plan adjustments for each week
  let currentPlan = { ...initialPlan };
  
  // Process each week's feedback and generate new adjusted plans
  weeklyFeedback.forEach((weekFeedback, weekIndex) => {
    // Analyze this week's feedback
    const avgDifficulty = weekFeedback.reduce((sum, f) => sum + f.difficulty, 0) / weekFeedback.length;
    const avgEnjoyment = weekFeedback.reduce((sum, f) => sum + f.enjoyment, 0) / weekFeedback.length;
    const avgFatigue = weekFeedback.reduce((sum, f) => sum + f.fatigue, 0) / weekFeedback.length;
    
    // Determine adjustment type
    let adjustmentType = "";
    let intensityChange = 0;
    let volumeChange = 0;
    
    if (avgDifficulty > 4 && avgFatigue > 4) {
      // Too hard and tiring, reduce intensity and volume
      adjustmentType = "Decrease Load";
      intensityChange = -0.15;
      volumeChange = -0.1;
    } else if (avgDifficulty < 2.5 && avgEnjoyment < 3) {
      // Too easy but not enjoyable, increase variety
      adjustmentType = "Increase Variety";
      intensityChange = 0.1;
      volumeChange = 0.05;
    } else if (avgDifficulty < 2) {
      // Too easy, increase intensity and volume
      adjustmentType = "Increase Challenge";
      intensityChange = 0.2;
      volumeChange = 0.15;
    } else if (avgDifficulty > 3 && avgDifficulty < 4 && avgEnjoyment > 3.5) {
      // Good challenge and enjoyable, slight increase
      adjustmentType = "Continue Progress";
      intensityChange = 0.08;
      volumeChange = 0.05;
    } else {
      // Maintain
      adjustmentType = "Maintain Stability";
      intensityChange = 0.02;
      volumeChange = 0.01;
    }
    
    // Simulate adaptive plan
    const adaptedPlan = simulateAdaptivePlan(currentPlan, {
      intensityChange,
      volumeChange,
      adjustmentType,
      week: weekIndex + 1
    });
    
    // Save this week's plan adjustment
    weeklyPlans.push({
      week: weekIndex + 1,
      plan: adaptedPlan,
      insights: {
        avgDifficulty,
        avgEnjoyment,
        avgFatigue,
        adjustmentType,
        intensityChange,
        volumeChange
      }
    });
    
    // Update current plan
    currentPlan = adaptedPlan;
  });
  
  return weeklyPlans;
}

// Simulate generating an adjusted plan
function simulateAdaptivePlan(
  basePlan: WorkoutPlan, 
  adjustment: { 
    intensityChange: number; 
    volumeChange: number; 
    adjustmentType: string;
    week: number;
  }
): WorkoutPlan {
  // Create a copy of the plan
  const newPlan: WorkoutPlan = {
    ...basePlan,
    id: `adapted_plan_week_${adjustment.week}`,
    name: `${basePlan.name} (Week ${adjustment.week})`,
    description: `${basePlan.description} - ${adjustment.adjustmentType} adjustment`,
    createdAt: new Date().toISOString(),
    days: JSON.parse(JSON.stringify(basePlan.days))
  };
  
  // Adjust each day's workouts
  newPlan.days.forEach(day => {
    day.exercises.forEach(exercise => {
      // Increase sets or reps
      if (exercise.sets) {
        const newSets = Math.max(1, Math.round(exercise.sets * (1 + adjustment.volumeChange)));
        exercise.sets = newSets;
      }
      
      if (exercise.reps) {
        const newReps = Math.max(1, Math.round(exercise.reps * (1 + adjustment.intensityChange)));
        exercise.reps = newReps;
      }
      
      if (exercise.duration) {
        const newDuration = Math.max(10, Math.round(exercise.duration * (1 + adjustment.intensityChange)));
        exercise.duration = newDuration;
      }
      
      // Adjust rest time
      if (exercise.restTime) {
        const newRest = Math.max(15, Math.round(exercise.restTime * (1 - adjustment.intensityChange * 0.5)));
        exercise.restTime = newRest;
      }
      
      // Randomly replace some exercises for variety
      if (Math.random() < 0.1 && adjustment.week > 1) {
        const variations = getExerciseVariations(exercise.name);
        if (variations.length > 0) {
          const randomVariation = variations[Math.floor(Math.random() * variations.length)];
          exercise.name = randomVariation;
          exercise.notes = "Changed to a variation based on your progress";
        }
      }
    });
  });
  
  return newPlan;
}

// Get exercise variations
function getExerciseVariations(exerciseName: string): string[] {
  const variations: Record<string, string[]> = {
    'Push-Ups': ['Incline Push-Ups', 'Diamond Push-Ups', 'Wide Push-Ups'],
    'Squats': ['Sumo Squats', 'Split Squats', 'Pistol Squats'],
    'Lunges': ['Reverse Lunges', 'Walking Lunges', 'Lateral Lunges'],
    'Planks': ['Side Planks', 'Plank with Shoulder Taps', 'RKC Plank'],
    // Add more variations
  };
  
  // Find matching variations
  for (const [base, vars] of Object.entries(variations)) {
    if (exerciseName.includes(base)) {
      return vars;
    }
  }
  
  return [];
}