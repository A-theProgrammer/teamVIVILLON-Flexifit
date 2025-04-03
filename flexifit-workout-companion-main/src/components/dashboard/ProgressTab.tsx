
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProgressChart } from './ProgressChart';
import { CompletionRate } from './CompletionRate';
import { ProfileSection } from './ProfileSection';
import { UserModel } from '@/types/user';

interface ProgressTabProps {
  user: UserModel;
}

export const ProgressTab = ({ user }: ProgressTabProps) => {
  // Sample data for the weekly workouts chart
  const weeklyWorkouts = [
    { name: 'Mon', workouts: 1 },
    { name: 'Tue', workouts: 0 },
    { name: 'Wed', workouts: 1 },
    { name: 'Thu', workouts: 1 },
    { name: 'Fri', workouts: 0 },
    { name: 'Sat', workouts: 1 },
    { name: 'Sun', workouts: 0 },
  ];

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
              completionRate={75} 
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
