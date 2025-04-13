import { UserFeedback } from '../adaptiveEngine/types';
import { WorkoutPlan, WorkoutDay, WorkoutExercise } from '../types/user';

/**
 * Utility functions for workout statistics
 */

// Exercise to body part mapping
export const exerciseToBodyParts: Record<string, string[]> = {
  'Push-Ups': ['Chest', 'Shoulders', 'Arms'],
  'Bench Press': ['Chest', 'Shoulders', 'Arms'],
  'Incline Press': ['Chest', 'Shoulders'],
  'Dips': ['Chest', 'Arms'],
  'Chest Fly': ['Chest'],
  'Pull-Ups': ['Back', 'Arms'],
  'Chin-Ups': ['Back', 'Arms'],
  'Rows': ['Back'],
  'Lat Pulldown': ['Back'],
  'Deadlift': ['Back', 'Legs'],
  'Squats': ['Legs', 'Core'],
  'Lunges': ['Legs'],
  'Leg Press': ['Legs'],
  'Leg Extensions': ['Legs'],
  'Leg Curls': ['Legs'],
  'Calf Raises': ['Legs'],
  'Shoulder Press': ['Shoulders'],
  'Lateral Raises': ['Shoulders'],
  'Front Raises': ['Shoulders'],
  'Bicep Curls': ['Arms'],
  'Tricep Extensions': ['Arms'],
  'Skull Crushers': ['Arms'],
  'Hammer Curls': ['Arms'],
  'Plank': ['Core'],
  'Crunches': ['Core'],
  'Leg Raises': ['Core'],
  'Russian Twists': ['Core'],
  'Running': ['Cardio'],
  'Cycling': ['Cardio'],
  'Jumping Jacks': ['Cardio'],
  'Burpees': ['Cardio', 'Core'],
  'HIIT': ['Cardio'],
  'Yoga': ['Flexibility'],
  'Stretching': ['Flexibility']
};

// Color palette for charts
export const colorPalette = {
  primary: '#3498db',
  secondary: '#2ecc71',
  accent: '#f39c12',
  danger: '#e74c3c',
  warning: '#f1c40f',
  info: '#1abc9c',
  dark: '#34495e',
  purple: '#9b59b6',
  orange: '#e67e22',
  gray: '#7f8c8d'
};

/**
 * Calculate completion percentage from feedback history
 */
export function calculateCompletionRate(
  feedbackHistory: UserFeedback[],
  workoutPlan: WorkoutPlan
): { daily: Record<string, number>; overall: number } {
  // Group feedback by date
  const feedbackByDate: Record<string, UserFeedback[]> = {};
  
  feedbackHistory.forEach(feedback => {
    const date = new Date(feedback.completionTime);
    const dateKey = date.toISOString().split('T')[0];
    
    if (!feedbackByDate[dateKey]) {
      feedbackByDate[dateKey] = [];
    }
    
    feedbackByDate[dateKey].push(feedback);
  });
  
  // Calculate average exercises per workout day
  const avgExercisesPerDay = workoutPlan.days.reduce(
    (sum, day) => sum + day.exercises.length, 0
  ) / workoutPlan.days.length;
  
  // Calculate daily completion rates
  const dailyCompletionRates: Record<string, number> = {};
  
  Object.entries(feedbackByDate).forEach(([dateKey, feedbacks]) => {
    const completionRate = Math.min(100, (feedbacks.length / avgExercisesPerDay) * 100);
    dailyCompletionRates[dateKey] = parseFloat(completionRate.toFixed(1));
  });
  
  // Calculate overall completion rate
  const totalPossibleExercises = Object.keys(feedbackByDate).length * avgExercisesPerDay;
  const totalCompletedExercises = feedbackHistory.length;
  const overallRate = totalPossibleExercises > 0 
    ? Math.min(100, (totalCompletedExercises / totalPossibleExercises) * 100)
    : 0;
  
  return {
    daily: dailyCompletionRates,
    overall: parseFloat(overallRate.toFixed(1))
  };
}

/**
 * Calculate body part distribution from feedback or workout plan
 */
export function calculateBodyPartDistribution(
  feedbackHistory: UserFeedback[],
  workoutPlan: WorkoutPlan
): Record<string, number> {
  const bodyPartCounts: Record<string, number> = {};
  
  if (feedbackHistory.length > 0) {
    // If feedback exists, calculate from completed exercises
    feedbackHistory.forEach(feedback => {
      const [dayNumber, exerciseIndex] = feedback.exerciseId.split('-').map(Number);
      
      // Find the corresponding day and exercise
      const day = workoutPlan.days.find(d => d.dayNumber === dayNumber);
      if (day && day.exercises[exerciseIndex]) {
        const exerciseName = day.exercises[exerciseIndex].name;
        
        // Map exercise to body parts
        const bodyParts = exerciseToBodyParts[exerciseName] || ['Other'];
        
        // Increment count for each body part
        bodyParts.forEach(part => {
          bodyPartCounts[part] = (bodyPartCounts[part] || 0) + 1;
        });
      }
    });
  } else {
    // If no feedback, calculate from workout plan structure
    workoutPlan.days.forEach(day => {
      day.exercises.forEach(exercise => {
        const bodyParts = exerciseToBodyParts[exercise.name] || ['Other'];
        
        bodyParts.forEach(part => {
          bodyPartCounts[part] = (bodyPartCounts[part] || 0) + 1;
        });
      });
    });
  }
  
  return bodyPartCounts;
}

/**
 * Calculate average feedback metrics by time period
 */
export function calculateFeedbackTrends(
  feedbackHistory: UserFeedback[],
  timeRange: '7d' | '30d' | '90d' | 'all'
): Array<{
  date: string;
  difficulty: number;
  fatigue: number;
  enjoyment: number;
}> {
  if (feedbackHistory.length === 0) {
    return [];
  }
  
  // Sort feedback by date
  const sortedFeedback = [...feedbackHistory].sort(
    (a, b) => a.completionTime - b.completionTime
  );
  
  // Determine aggregation level
  let aggregationPeriod: 'day' | 'week' | 'month';
  switch (timeRange) {
    case '7d':
    case '30d':
      aggregationPeriod = 'day';
      break;
    case '90d':
      aggregationPeriod = 'week';
      break;
    case 'all':
    default:
      aggregationPeriod = 'month';
      break;
  }
  
  // Group feedback by period
  const groupedFeedback: Record<string, {
    sum: { difficulty: number; fatigue: number; enjoyment: number; };
    count: number;
  }> = {};
  
  sortedFeedback.forEach(feedback => {
    const date = new Date(feedback.completionTime);
    let periodKey: string;
    
    if (aggregationPeriod === 'day') {
      periodKey = date.toISOString().split('T')[0];
    } else if (aggregationPeriod === 'week') {
      // Get first day of week (Sunday)
      const day = date.getDay();
      const diff = date.getDate() - day;
      date.setDate(diff);
      periodKey = `${date.getFullYear()}-W${Math.ceil((date.getDate() + 1) / 7)}`;
    } else {
      // Month
      periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }
    
    if (!groupedFeedback[periodKey]) {
      groupedFeedback[periodKey] = {
        sum: { difficulty: 0, fatigue: 0, enjoyment: 0 },
        count: 0
      };
    }
    
    groupedFeedback[periodKey].sum.difficulty += feedback.difficulty;
    groupedFeedback[periodKey].sum.fatigue += feedback.fatigue;
    groupedFeedback[periodKey].sum.enjoyment += feedback.enjoyment;
    groupedFeedback[periodKey].count += 1;
  });
  
  // Calculate averages
  return Object.entries(groupedFeedback)
    .map(([periodKey, data]) => {
      // Format date for display
      let displayDate: string;
      if (aggregationPeriod === 'day') {
        const [year, month, day] = periodKey.split('-');
        displayDate = `${month}/${day}`;
      } else if (aggregationPeriod === 'week') {
        const [year, week] = periodKey.split('-W');
        displayDate = `Week ${week}`;
      } else {
        const [year, month] = periodKey.split('-');
        displayDate = new Date(parseInt(year), parseInt(month) - 1, 1)
          .toLocaleString('default', { month: 'short', year: '2-digit' });
      }
      
      return {
        date: displayDate,
        difficulty: parseFloat((data.sum.difficulty / data.count).toFixed(1)),
        fatigue: parseFloat((data.sum.fatigue / data.count).toFixed(1)),
        enjoyment: parseFloat((data.sum.enjoyment / data.count).toFixed(1))
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Export workout data to CSV format
 */
export function exportWorkoutDataToCsv(
  feedbackHistory: UserFeedback[],
  workoutPlan: WorkoutPlan
): string {
  // Create CSV header
  const headers = [
    'Date',
    'Exercise',
    'Difficulty (1-5)',
    'Fatigue (1-5)',
    'Enjoyment (1-5)',
    'Notes'
  ];
  
  // Create exercise name lookup from workout plan
  const exerciseLookup: Record<string, string> = {};
  
  workoutPlan.days.forEach(day => {
    day.exercises.forEach((exercise, index) => {
      const exerciseId = `${day.dayNumber}-${index}`;
      exerciseLookup[exerciseId] = exercise.name;
    });
  });
  
  // Process feedback into rows
  const rows = feedbackHistory.map(feedback => {
    const date = new Date(feedback.completionTime)
      .toISOString()
      .split('T')[0];
    
    const exerciseName = exerciseLookup[feedback.exerciseId] || feedback.exerciseId;
    
    return [
      date,
      exerciseName,
      feedback.difficulty,
      feedback.fatigue,
      feedback.enjoyment,
      feedback.notes || ''
    ];
  });
  
  // Combine header and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => {
      // Wrap string cells with quotes and escape existing quotes
      if (typeof cell === 'string') {
        return `"${cell.replace(/"/g, '""')}"`;
      }
      return cell;
    }).join(','))
  ].join('\n');
  
  return csvContent;
}

/**
 * Download data as a CSV file
 */
export function downloadCsv(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
