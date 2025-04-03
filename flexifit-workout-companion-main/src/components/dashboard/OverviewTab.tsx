
import React from 'react';
import { WorkoutPlan } from '@/types/user';
import { MetricsCards } from './MetricsCards';
import { ProgressChart } from './ProgressChart';
import { CompletionRate } from './CompletionRate';
import { WorkoutTodoList } from '@/components/workout/WorkoutTodoList';
import { WorkoutPlanDisplay } from '@/components/workout/WorkoutPlanDisplay';

interface OverviewTabProps {
  selectedPlan: WorkoutPlan | null;
  metrics: {
    totalWorkouts: number;
    currentStreak: number;
    caloriesBurned: number;
    totalMinutes: number;
    completionRate: number;
  };
  weeklyWorkouts: { name: string; workouts: number }[];
  completedExercises: string[];
  toggleExerciseCompletion: (exerciseId: string, completed: boolean) => void;
}

export function OverviewTab({
  selectedPlan,
  metrics,
  weeklyWorkouts,
  completedExercises,
  toggleExerciseCompletion
}: OverviewTabProps) {
  return (
    <div className="space-y-6">
      <MetricsCards metrics={metrics} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ProgressChart weeklyWorkouts={weeklyWorkouts} />
        </div>
        
        <div>
          <CompletionRate completionRate={metrics.completionRate} />
        </div>
      </div>
      
      {selectedPlan && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <WorkoutTodoList 
              plan={selectedPlan}
              completedExercises={completedExercises}
              onToggleExercise={toggleExerciseCompletion}
            />
          </div>
          <div className="lg:col-span-2">
            <WorkoutPlanDisplay plan={selectedPlan} />
          </div>
        </div>
      )}
    </div>
  );
}
