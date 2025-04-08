import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@/contexts/UserContext';
import { Activity, Brain, TrendingUp } from 'lucide-react';

export function AdaptiveInsights() {
  const { feedbackHistory } = useUser();
  
  // Calculate insights from feedback
  const calculateInsights = () => {
    if (feedbackHistory.length === 0) return null;
    
    // Get recent feedback
    const recentFeedback = feedbackHistory.slice(-10);
    
    // Calculate averages
    const avgDifficulty = recentFeedback.reduce((sum, f) => sum + f.difficulty, 0) / recentFeedback.length;
    const avgEnjoyment = recentFeedback.reduce((sum, f) => sum + f.enjoyment, 0) / recentFeedback.length;
    const avgFatigue = recentFeedback.reduce((sum, f) => sum + f.fatigue, 0) / recentFeedback.length;
    
    // Calculate progress metrics
    const improvedExercises = new Set();
    const exerciseProgress: Record<string, any[]> = {};
    
    // Group feedback by exercise
    feedbackHistory.forEach(feedback => {
      if (!exerciseProgress[feedback.exerciseId]) {
        exerciseProgress[feedback.exerciseId] = [];
      }
      exerciseProgress[feedback.exerciseId].push(feedback);
    });
    
    // Identify improved exercises
    Object.entries(exerciseProgress).forEach(([exerciseId, feedbacks]) => {
      if (feedbacks.length >= 2) {
        const sorted = [...feedbacks].sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        
        const first = sorted[0];
        const last = sorted[sorted.length - 1];
        
        // If difficulty decreased or enjoyment increased
        if (last.difficulty < first.difficulty || last.enjoyment > first.enjoyment) {
          improvedExercises.add(exerciseId);
        }
      }
    });
    
    return {
      avgDifficulty: avgDifficulty.toFixed(1),
      avgEnjoyment: avgEnjoyment.toFixed(1),
      avgFatigue: avgFatigue.toFixed(1),
      feedbackCount: feedbackHistory.length,
      improvedExerciseCount: improvedExercises.size,
      adaptiveStatus: feedbackHistory.length >= 5 ? 'Active' : 'Learning'
    };
  };
  
  const insights = calculateInsights();
  
  if (!insights) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="mr-2 h-5 w-5 text-primary" />
            Adaptive Training Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No feedback data available yet. Complete workouts and provide feedback to see insights.</p>
          <div className="mt-4 p-4 bg-secondary/50 rounded-lg">
            <h4 className="font-medium mb-2">How Adaptive Training Works</h4>
            <p className="text-sm text-muted-foreground">
              The adaptive algorithm analyzes your workout performance and feedback to automatically adjust exercise 
              parameters, ensuring optimal progress. As you provide more feedback, the system will 
              learn your preferences and capabilities.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Brain className="mr-2 h-5 w-5 text-primary" />
          Adaptive Training Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-secondary rounded-lg">
            <div className="flex justify-center mb-2">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">Average Difficulty</p>
            <p className="text-2xl font-bold">{insights.avgDifficulty}<span className="text-sm font-normal">/5</span></p>
          </div>
          <div className="text-center p-4 bg-secondary rounded-lg">
            <div className="flex justify-center mb-2">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">Average Enjoyment</p>
            <p className="text-2xl font-bold">{insights.avgEnjoyment}<span className="text-sm font-normal">/5</span></p>
          </div>
          <div className="text-center p-4 bg-secondary rounded-lg">
            <div className="flex justify-center mb-2">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">Adaptive Status</p>
            <p className="text-2xl font-bold">{insights.adaptiveStatus}</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm">Improved Exercises</p>
            <p className="text-sm font-medium">{insights.improvedExerciseCount}</p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-sm">Feedback Entries</p>
            <p className="text-sm font-medium">{insights.feedbackCount}</p>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-secondary/50 rounded-lg">
          <h4 className="font-medium mb-2">Adaptive Adjustments</h4>
          <p className="text-sm text-muted-foreground">
            Based on your {insights.feedbackCount} feedback entries, your workouts are being 
            automatically adjusted to match your progress and preferences. The system will continue to refine
            your plan as more data becomes available.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}