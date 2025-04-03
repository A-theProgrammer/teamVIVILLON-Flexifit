
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProgressChart } from './ProgressChart';
import { CompletionRate } from './CompletionRate';
import { ProfileSection } from './ProfileSection';
import { UserModel } from '@/types/user';
import { useUser } from '@/contexts/UserContext';

interface ProgressTabProps {
  user: UserModel;
}

export const ProgressTab = ({ user }: ProgressTabProps) => {
  const { completedExercises, workoutPlans } = useUser();
  
  // Calculate workout completion data from completed exercises
  const weeklyWorkouts = [
    { name: 'Mon', workouts: completedExercises.filter(id => id.startsWith('1-')).length > 0 ? 1 : 0 },
    { name: 'Tue', workouts: completedExercises.filter(id => id.startsWith('2-')).length > 0 ? 1 : 0 },
    { name: 'Wed', workouts: completedExercises.filter(id => id.startsWith('3-')).length > 0 ? 1 : 0 },
    { name: 'Thu', workouts: completedExercises.filter(id => id.startsWith('4-')).length > 0 ? 1 : 0 },
    { name: 'Fri', workouts: completedExercises.filter(id => id.startsWith('5-')).length > 0 ? 1 : 0 },
    { name: 'Sat', workouts: completedExercises.filter(id => id.startsWith('6-')).length > 0 ? 1 : 0 },
    { name: 'Sun', workouts: completedExercises.filter(id => id.startsWith('7-')).length > 0 ? 1 : 0 },
  ];
  
  // Calculate completion rate based on actual data
  const totalExercisesCompleted = completedExercises.length;
  const totalPossibleExercises = workoutPlans.reduce(
    (total, plan) => total + plan.days.reduce(
      (dayTotal, day) => dayTotal + day.exercises.length, 0
    ), 0
  ) || 1; // Avoid division by zero
  
  const completionRate = Math.min(100, Math.round((totalExercisesCompleted / totalPossibleExercises) * 100));

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <ProfileSection user={user} />
      
      {/* Progress Metrics */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Workout Completion Rate</CardTitle>
            <CardDescription>
              Your weekly workout completion percentage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CompletionRate 
              completionRate={completionRate} 
              className="w-full aspect-square max-w-[200px] mx-auto"
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Fitness Progress</CardTitle>
            <CardDescription>
              Your consistency over the last 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProgressChart weeklyWorkouts={weeklyWorkouts} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
