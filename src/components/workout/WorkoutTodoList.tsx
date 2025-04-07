
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { WorkoutPlan, WorkoutExercise } from '@/types/user';
import { toast } from 'sonner';
import { useUser } from '@/contexts/UserContext';
import { ExerciseFeedback } from './ExerciseFeedback';

interface WorkoutTodoListProps {
  plan: WorkoutPlan;
  completedExercises: string[];
  onToggleExercise: (exerciseId: string, completed: boolean) => void;
}

export function WorkoutTodoList({ 
  plan, 
  completedExercises, 
  onToggleExercise 
}: WorkoutTodoListProps) {
  const [showFeedbackFor, setShowFeedbackFor] = useState<string | null>(null);
  const { submitExerciseFeedback } = useUser();
  
  // Get current day of the week (0-6, where 0 is Sunday)
  const today = new Date().getDay();
  // Convert to 1-7 where 1 is Monday
  const dayNumber = today === 0 ? 7 : today;
  
  // Find today's workout or the next available one
  const todaysWorkout = plan.days.find(day => day.dayNumber === dayNumber) || 
                       plan.days[0];
  
  const handleToggleExercise = (exerciseId: string, checked: boolean) => {
    onToggleExercise(exerciseId, checked);
    
    if (checked) {
      toast.success("Exercise completed! Great job!");
    }
  };
  
  // Helper function to get exercise name from ID
  const getExerciseName = (id: string): string => {
    const [dayNum, exerciseIndex] = id.split('-').map(Number);
    const day = plan.days.find(d => d.dayNumber === dayNum);
    if (day && day.exercises[exerciseIndex]) {
      return day.exercises[exerciseIndex].name;
    }
    return "Exercise";
  };
  
  // Handle feedback submission
  const handleFeedbackSubmit = (feedback: any) => {
    submitExerciseFeedback(feedback);
    setShowFeedbackFor(null);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Today's Workout</CardTitle>
      </CardHeader>
      <CardContent>
        {showFeedbackFor ? (
          <ExerciseFeedback 
            exerciseId={showFeedbackFor}
            exerciseName={getExerciseName(showFeedbackFor)}
            onSubmitFeedback={handleFeedbackSubmit}
            onCancel={() => setShowFeedbackFor(null)}
          />
        ) : (
          <div className="space-y-2">
            {todaysWorkout.exercises.map((exercise: WorkoutExercise, index: number) => {
              const exerciseId = `${todaysWorkout.dayNumber}-${index}`;
              const isCompleted = completedExercises.includes(exerciseId);
              
              return (
                <div 
                  key={exerciseId} 
                  className="flex flex-col space-y-2 p-2 rounded-md bg-secondary/30"
                >
                  <div className="flex items-center space-x-3">
                    <Checkbox 
                      checked={isCompleted} 
                      onCheckedChange={(checked) => 
                        handleToggleExercise(exerciseId, checked as boolean)
                      } 
                      id={exerciseId}
                    />
                    <div className="flex-1">
                      <label 
                        htmlFor={exerciseId}
                        className={`font-medium cursor-pointer ${isCompleted ? 'line-through text-muted-foreground' : ''}`}
                      >
                        {exercise.name}
                      </label>
                      <p className="text-xs text-muted-foreground">
                        {exercise.sets && `${exercise.sets} sets`}
                        {exercise.reps && ` × ${exercise.reps} reps`}
                        {exercise.duration && ` × ${exercise.duration} sec`}
                      </p>
                    </div>
                  </div>
                  
                  {isCompleted && (
                    <div className="ml-7">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-xs h-7 px-2"
                        onClick={() => setShowFeedbackFor(exerciseId)}
                      >
                        Provide Feedback
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}