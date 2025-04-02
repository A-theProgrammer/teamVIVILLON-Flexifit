
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUser } from '@/contexts/UserContext';

import { PlanSelector } from '@/components/dashboard/PlanSelector';
import { OverviewTab } from '@/components/dashboard/OverviewTab';
import { WorkoutsTab } from '@/components/dashboard/WorkoutsTab';
import { ProgressTab } from '@/components/dashboard/ProgressTab';
import { NotAuthenticatedView } from '@/components/dashboard/NotAuthenticatedView';

const DashboardPage = () => {
  const { currentPlan, workoutPlans, user, isAuthenticated, completedExercises, toggleExerciseCompletion } = useUser();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(currentPlan?.id || null);
  
  // Find the selected plan
  const selectedPlan = selectedPlanId 
    ? workoutPlans.find(plan => plan.id === selectedPlanId) || currentPlan
    : currentPlan;
  
  // Sample data for charts and metrics - in a real application, this would be calculated from actual user data
  const weeklyWorkouts = [
    { name: 'Mon', workouts: completedExercises.filter(id => id.startsWith('1-')).length > 0 ? 1 : 0 },
    { name: 'Tue', workouts: completedExercises.filter(id => id.startsWith('2-')).length > 0 ? 1 : 0 },
    { name: 'Wed', workouts: completedExercises.filter(id => id.startsWith('3-')).length > 0 ? 1 : 0 },
    { name: 'Thu', workouts: completedExercises.filter(id => id.startsWith('4-')).length > 0 ? 1 : 0 },
    { name: 'Fri', workouts: completedExercises.filter(id => id.startsWith('5-')).length > 0 ? 1 : 0 },
    { name: 'Sat', workouts: completedExercises.filter(id => id.startsWith('6-')).length > 0 ? 1 : 0 },
    { name: 'Sun', workouts: completedExercises.filter(id => id.startsWith('7-')).length > 0 ? 1 : 0 },
  ];
  
  // Calculate metrics
  const totalWorkoutsCompleted = weeklyWorkouts.filter(day => day.workouts > 0).length;
  const totalExercisesCompleted = completedExercises.length;
  
  const metrics = {
    totalWorkouts: totalWorkoutsCompleted,
    currentStreak: user?.dynamicAttributes?.workoutProgress?.streakDays || 0,
    caloriesBurned: totalExercisesCompleted * 50, // Rough estimate
    totalMinutes: totalExercisesCompleted * 5,  // Rough estimate
    completionRate: currentPlan ? 
      Math.min(100, Math.round((totalExercisesCompleted / 
        (currentPlan.days.reduce((acc, day) => acc + day.exercises.length, 0) || 1)) * 100)) : 0
  };
  
  if (!isAuthenticated) {
    return <NotAuthenticatedView />;
  }
  
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Your Fitness Dashboard</h1>
          <p className="text-muted-foreground">Track your progress and manage your workout plans</p>
        </div>
        <PlanSelector
          workoutPlans={workoutPlans}
          currentPlan={currentPlan}
          selectedPlanId={selectedPlanId}
          setSelectedPlanId={setSelectedPlanId}
        />
      </div>
      
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="workouts">Workouts</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <OverviewTab
            selectedPlan={selectedPlan}
            metrics={metrics}
            weeklyWorkouts={weeklyWorkouts}
            completedExercises={completedExercises}
            toggleExerciseCompletion={toggleExerciseCompletion}
          />
        </TabsContent>
        
        <TabsContent value="workouts">
          <WorkoutsTab workoutPlans={workoutPlans} />
        </TabsContent>
        
        <TabsContent value="progress">
          <ProgressTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardPage;
