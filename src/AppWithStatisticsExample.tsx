import React, { useState } from 'react';
import WorkoutTabs from './components/navigation/WorkoutTabs';
import TodayWorkout from './components/workout/TodayWorkout';
import WorkoutDayList from './components/workout/WorkoutDayList';
import WorkoutCalendar from './components/workout/WorkoutCalendar';
import WorkoutFeedbackForm from './components/feedback/WorkoutFeedbackForm';
import UserMetricsDisplay from './components/user/UserMetricsDisplay';
import UserProfileCard from './components/user/UserProfileCard';
import AdaptiveChangesDisplay from './components/adaptation/AdaptiveChangesDisplay';
import ProgressionLevelIndicator from './components/adaptation/ProgressionLevelIndicator';
import StatisticsDashboard from './components/statistics/StatisticsDashboard'; // New import
import { UserModel, WorkoutPlan } from './types/user';
import { UserFeedback, ProgressionLevel, AdjustmentResult } from './adaptiveEngine/types';
import { useAppContext } from './context/AppContext';

interface AppWithStatisticsExampleProps {
  user: UserModel;
  workoutPlan: WorkoutPlan;
  feedbackHistory: UserFeedback[];
  adaptationResult: AdjustmentResult | null;
  progressionLevel: ProgressionLevel;
}

const AppWithStatisticsExample: React.FC<AppWithStatisticsExampleProps> = ({
  user,
  workoutPlan,
  feedbackHistory,
  adaptationResult,
  progressionLevel
}) => {
  // Tab state
  const [activeTab, setActiveTab] = useState(0);
  
  // Generate mock progression level history for statistics
  const progressionLevels = React.useMemo(() => {
    const now = new Date();
    const levels = [];
    
    for (let i = 30; i >= 0; i -= 3) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Simulate a typical progression pattern
      let level: ProgressionLevel;
      
      if (i > 25) {
        level = ProgressionLevel.SlowProgress;
      } else if (i > 18) {
        level = ProgressionLevel.NormalProgress;
      } else if (i > 15) {
        level = ProgressionLevel.Deload; // Deload week
      } else if (i > 10) {
        level = ProgressionLevel.Maintenance;
      } else if (i > 6) {
        level = ProgressionLevel.ModerateProgress;
      } else if (i > 3) {
        level = ProgressionLevel.FastProgress;
      } else {
        level = progressionLevel; // Current level
      }
      
      levels.push({
        date,
        level
      });
    }
    
    return levels;
  }, [progressionLevel]);
  
  return (
    <div className="app-container">
      <WorkoutTabs
        tabTitles={[
          "Today's Workout", 
          "Workout Plan", 
          "Feedback", 
          "My Profile",
          "Statistics" // New tab for statistics
        ]}
        initialTabIndex={activeTab}
      >
        {/* Tab 1: Today's Workout */}
        <div>
          <TodayWorkout 
            workoutPlan={workoutPlan} 
          />
          <ProgressionLevelIndicator 
            progressionLevel={progressionLevel} 
          />
        </div>
        
        {/* Tab 2: Workout Plan */}
        <div>
          <WorkoutCalendar 
            workoutPlan={workoutPlan} 
          />
          <WorkoutDayList 
            workoutPlan={workoutPlan} 
          />
        </div>
        
        {/* Tab 3: Feedback */}
        <div>
          <WorkoutFeedbackForm 
            workoutPlan={workoutPlan}
            onSubmitFeedback={feedback => console.log('Feedback submitted:', feedback)} 
          />
          <AdaptiveChangesDisplay 
            changes={adaptationResult} 
          />
        </div>
        
        {/* Tab 4: My Profile */}
        <div>
          <UserProfileCard 
            user={user}
            onEditClick={() => console.log('Edit profile clicked')} 
          />
          <UserMetricsDisplay 
            user={user}
            feedbackHistory={feedbackHistory} 
          />
        </div>
        
        {/* Tab 5: Statistics - New Tab */}
        <div>
          <StatisticsDashboard
            user={user}
            workoutPlan={workoutPlan}
            feedbackHistory={feedbackHistory}
            progressionLevels={progressionLevels}
          />
        </div>
      </WorkoutTabs>
    </div>
  );
};

export default AppWithStatisticsExample;