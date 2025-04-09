// src/components/adaptive/UserComparison.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { WorkoutPlanDisplay } from '@/components/workout/WorkoutPlanDisplay';
import { Users, Target, Activity, Calendar } from 'lucide-react';
import { sampleUsers, generateSampleUserPlans } from '@/utils/sampleUsers';

export function UserComparison() {
  const [userPlans, setUserPlans] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('user_beginner_weight_loss');
  
  // Generate sample user plans
  useEffect(() => {
    const plans = generateSampleUserPlans();
    setUserPlans(plans);
  }, []);
  
  // Get currently selected user and plan
  const currentUserPlan = userPlans.find(up => up.user.userId === selectedUser);
  
  // If data isn't loaded yet, show loading state
  if (userPlans.length === 0 || !currentUserPlan) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5 text-primary" />
            User Personalization Examples
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading...</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="mr-2 h-5 w-5 text-primary" />
          User Personalization Examples
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          This example demonstrates how the system generates personalized recommendations for different user profiles.
          Select different users to see how recommended plans differ.
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
          {sampleUsers.map(user => (
            <Card
              key={user.userId}
              className={`cursor-pointer transition-all ${
                selectedUser === user.userId ? 'border-primary' : ''
              }`}
              onClick={() => setSelectedUser(user.userId)}
            >
              <CardContent className="p-4">
                <div className="flex flex-col items-center">
                  <Avatar className="h-16 w-16 mb-2">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {user.staticAttributes.basicInformation.name.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-medium text-center">
                    {user.staticAttributes.basicInformation.name}
                  </h3>
                  <Badge variant="outline" className="mt-1">
                    {user.staticAttributes.exerciseBackground.experienceLevel === 'beginner' && 'Beginner'}
                    {user.staticAttributes.exerciseBackground.experienceLevel === 'intermediate' && 'Intermediate'}
                    {user.staticAttributes.exerciseBackground.experienceLevel === 'advanced' && 'Advanced'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="space-y-4">
            <h3 className="font-medium text-lg border-b pb-2">User Profile</h3>
            
            <div>
              <h4 className="text-sm text-muted-foreground mb-1">Basic Information</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Age</span>
                  <span className="font-medium">
                    {currentUserPlan.user.staticAttributes.basicInformation.age}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Gender</span>
                  <span className="font-medium">
                    {currentUserPlan.user.staticAttributes.basicInformation.gender === 'male' ? 'Male' : 'Female'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Height</span>
                  <span className="font-medium">
                    {currentUserPlan.user.staticAttributes.basicInformation.height} cm
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Weight</span>
                  <span className="font-medium">
                    {currentUserPlan.user.staticAttributes.basicInformation.weight} kg
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm text-muted-foreground mb-1">Fitness Background</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Experience Level</span>
                  <span className="font-medium">
                    {currentUserPlan.user.staticAttributes.exerciseBackground.experienceLevel === 'beginner' && 'Beginner'}
                    {currentUserPlan.user.staticAttributes.exerciseBackground.experienceLevel === 'intermediate' && 'Intermediate'}
                    {currentUserPlan.user.staticAttributes.exerciseBackground.experienceLevel === 'advanced' && 'Advanced'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Weekly Frequency</span>
                  <span className="font-medium">
                    {currentUserPlan.user.staticAttributes.exerciseBackground.currentExerciseHabits.frequencyPerWeek} times/week
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Session Duration</span>
                  <span className="font-medium">
                    {currentUserPlan.user.staticAttributes.exerciseBackground.currentExerciseHabits.sessionDuration} minutes
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm text-muted-foreground mb-1">Fitness Goal</h4>
              <div className="flex items-center space-x-2 mt-2">
                <Target className="h-5 w-5 text-primary" />
                <span className="font-medium">
                  {currentUserPlan.user.staticAttributes.fitnessGoals.primaryGoal === 'fat_loss' && 'Weight Loss'}
                  {currentUserPlan.user.staticAttributes.fitnessGoals.primaryGoal === 'muscle_gain' && 'Muscle Gain'}
                  {currentUserPlan.user.staticAttributes.fitnessGoals.primaryGoal === 'endurance' && 'Endurance'}
                  {currentUserPlan.user.staticAttributes.fitnessGoals.primaryGoal === 'general_health' && 'General Health'}
                </span>
              </div>
            </div>
            
            {currentUserPlan.user.staticAttributes.basicInformation.healthStatus.length > 0 && (
              <div>
                <h4 className="text-sm text-muted-foreground mb-1">Health Status</h4>
                <div className="space-y-1 mt-1">
                  {currentUserPlan.user.staticAttributes.basicInformation.healthStatus.map((item: string, idx: number) => (
                    <Badge key={idx} variant="outline" className="mr-1">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="md:col-span-2">
            <h3 className="font-medium text-lg border-b pb-2 mb-4">Personalized Workout Plan</h3>
            <WorkoutPlanDisplay plan={currentUserPlan.plan} compact={true} />
          </div>
        </div>
        
        <div className="mt-8 p-4 bg-secondary/50 rounded-lg">
          <h3 className="font-medium mb-3 flex items-center">
            <Activity className="h-5 w-5 mr-2 text-primary" />
            Personalization Highlights
          </h3>
          
          <div className="space-y-2 text-sm">
            {selectedUser === 'user_beginner_weight_loss' && (
              <>
                <p>• As a beginner with weight loss goals, the system recommends higher-repetition, compound movement exercises</p>
                <p>• Shorter rest periods to increase metabolic effect</p>
                <p>• Includes HIIT elements to maximize calorie burn</p>
                <p>• Moderate intensity to avoid overwhelming a beginner</p>
              </>
            )}
            
            {selectedUser === 'user_intermediate_muscle' && (
              <>
                <p>• As an intermediate trainee focused on muscle gain, the system recommends more strength-focused movements</p>
                <p>• Training plan includes more muscle group isolation work</p>
                <p>• Rest periods are longer to allow for complete recovery and maximum force production</p>
                <p>• Training frequency increased to 4-5 times per week to match user capability and goals</p>
              </>
            )}
            
            {selectedUser === 'user_advanced_endurance' && (
              <>
                <p>• As an advanced trainee focused on endurance, the system recommends more aerobic and compound training</p>
                <p>• Training plan includes a mix of interval training and steady-state work</p>
                <p>• Greater variation in intensity, including high-intensity peaks and recovery periods</p>
                <p>• More complex training modalities such as pyramid sets, supersets, and other advanced methods</p>
              </>
            )}
            
            {selectedUser === 'user_senior_health' && (
              <>
                <p>• Considering age and health status, the system recommends low-impact, safe training modalities</p>
                <p>• Specifically avoids movements that could aggravate joint issues</p>
                <p>• Includes more balance and stability exercises to help prevent falls</p>
                <p>• Lower intensity with focus on movement quality and safety</p>
                <p>• Avoids head-down positions that could elevate blood pressure due to hypertension concerns</p>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}