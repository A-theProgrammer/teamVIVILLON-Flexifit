// src/components/adaptive/AdaptiveTimeline.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WorkoutPlanDisplay } from '@/components/workout/WorkoutPlanDisplay';
import { generateMockUserJourney, generateAdaptiveResponses } from '@/utils/mockDataGenerator';
import { ArrowLeft, ArrowRight, Calendar, TrendingUp, Activity } from 'lucide-react';

export function AdaptiveTimeline() {
  // Start with an initial plan
  const initialPlan = {
    id: 'initial_plan',
    name: 'Initial Training Plan',
    description: 'Base plan generated from initial user profile',
    createdAt: new Date().toISOString(),
    days: [
      {
        dayNumber: 1,
        focus: 'Upper Body',
        exercises: [
          { name: 'Push-Ups', sets: 3, reps: 8, restTime: 60, intensity: 'Medium' },
          { name: 'Resistance Band Rows', sets: 3, reps: 10, restTime: 60, intensity: 'Medium' },
          { name: 'Lateral Raises', sets: 3, reps: 12, restTime: 45, intensity: 'Medium' }
        ]
      },
      {
        dayNumber: 2,
        focus: 'Lower Body',
        exercises: [
          { name: 'Bodyweight Squats', sets: 3, reps: 12, restTime: 60, intensity: 'Medium' },
          { name: 'Lunges', sets: 3, reps: 10, restTime: 60, intensity: 'Medium' },
          { name: 'Calf Raises', sets: 3, reps: 15, restTime: 45, intensity: 'Low' }
        ]
      },
      {
        dayNumber: 3,
        focus: 'Core',
        exercises: [
          { name: 'Planks', sets: 3, duration: 30, restTime: 45, intensity: 'Medium' },
          { name: 'Russian Twists', sets: 3, reps: 10, restTime: 30, intensity: 'Medium' },
          { name: 'Mountain Climbers', sets: 3, duration: 30, restTime: 45, intensity: 'High' }
        ]
      }
    ]
  };
  
  // Generate 8 weeks of simulated user feedback
  const feedbackHistory = generateMockUserJourney(8, 9, 3.2, 0.15);
  
  // Generate weekly plan adjustments
  const weeklyPlans = generateAdaptiveResponses(initialPlan, feedbackHistory);
  
  // State management
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [activeTab, setActiveTab] = useState('feedback');
  
  // Extract chart data
  const chartData = weeklyPlans.map(week => ({
    week: `Week ${week.week}`,
    difficulty: week.insights.avgDifficulty.toFixed(1),
    enjoyment: week.insights.avgEnjoyment.toFixed(1),
    fatigue: week.insights.avgFatigue.toFixed(1),
  }));
  
  // Get current week data
  const currentWeekData = weeklyPlans.find(w => w.week === selectedWeek) || weeklyPlans[0];
  
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="mr-2 h-5 w-5 text-primary" />
          Adaptive Training Timeline Simulation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <p className="text-sm text-muted-foreground mb-4">
            This simulation demonstrates how the adaptive algorithm adjusts training plans over time based on user feedback and progress.
            Explore how the system dynamically adjusts difficulty, intensity, and focus throughout an 8-week training cycle based on user performance.
          </p>
          
          {/* Timeline navigation */}
          <div className="flex items-center justify-between mb-6">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setSelectedWeek(Math.max(1, selectedWeek - 1))}
              disabled={selectedWeek <= 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Previous Week
            </Button>
            
            <div className="font-medium">Week {selectedWeek} of 8</div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setSelectedWeek(Math.min(8, selectedWeek + 1))}
              disabled={selectedWeek >= 8}
            >
              Next Week <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
          
          {/* Progress chart */}
          <div className="h-[300px] mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis domain={[1, 5]} />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="difficulty" 
                  stroke="#8884d8" 
                  activeDot={{ r: 8 }} 
                  name="Perceived Difficulty"
                />
                <Line 
                  type="monotone" 
                  dataKey="enjoyment" 
                  stroke="#82ca9d" 
                  name="Enjoyment"
                />
                <Line 
                  type="monotone" 
                  dataKey="fatigue" 
                  stroke="#ff7300" 
                  name="Fatigue"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {/* Weekly adjustment info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-secondary p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <Activity className="mr-2 h-5 w-5 text-primary" />
                <h3 className="font-medium">Adjustment Type</h3>
              </div>
              <p className="text-lg font-bold">{currentWeekData.insights.adjustmentType}</p>
            </div>
            
            <div className="bg-secondary p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <TrendingUp className="mr-2 h-5 w-5 text-primary" />
                <h3 className="font-medium">Intensity Change</h3>
              </div>
              <p className="text-lg font-bold">
                {(currentWeekData.insights.intensityChange * 100).toFixed(0)}%
                {currentWeekData.insights.intensityChange > 0 ? ' Increase' : ' Decrease'}
              </p>
            </div>
            
            <div className="bg-secondary p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <Activity className="mr-2 h-5 w-5 text-primary" />
                <h3 className="font-medium">Volume Change</h3>
              </div>
              <p className="text-lg font-bold">
                {(currentWeekData.insights.volumeChange * 100).toFixed(0)}%
                {currentWeekData.insights.volumeChange > 0 ? ' Increase' : ' Decrease'}
              </p>
            </div>
          </div>
          
          {/* Plan content */}
          <Tabs 
            defaultValue="feedback" 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="mt-6"
          >
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="plan">Adaptive Plan</TabsTrigger>
              <TabsTrigger value="feedback">User Feedback</TabsTrigger>
            </TabsList>
            
            <TabsContent value="plan" className="mt-4">
              <WorkoutPlanDisplay plan={currentWeekData.plan} compact={true} />
            </TabsContent>
            
            <TabsContent value="feedback" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-medium mb-4">Week {selectedWeek} Sample User Feedback</h3>
                  
                  <div className="space-y-4">
                    {feedbackHistory
                      .filter(f => {
                        const date = new Date(f.timestamp);
                        const weekNumber = Math.ceil(
                          (8 - (new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 7))
                        );
                        return Math.round(weekNumber) === selectedWeek;
                      })
                      .slice(0, 3)
                      .map((feedback, idx) => (
                        <div key={idx} className="p-3 bg-secondary/50 rounded-lg">
                          <div className="flex justify-between mb-2">
                            <span className="font-medium">Exercise {feedback.exerciseId}</span>
                            <span className="text-sm text-muted-foreground">
                              {new Date(feedback.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Difficulty: </span>
                              <span className="font-medium">{feedback.difficulty}/5</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Fatigue: </span>
                              <span className="font-medium">{feedback.fatigue}/5</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Enjoyment: </span>
                              <span className="font-medium">{feedback.enjoyment}/5</span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}