import React, { useState, useEffect } from 'react';
import { UserModel, WorkoutPlan } from './types/user';
import { UserFeedback, ProgressionLevel } from './adaptiveEngine/types';
import { useAppContext } from './context/AppContext';
import StatisticsDashboard from './components/statistics/StatisticsDashboard';
import SimpleNavBar from './components/navigation/SimpleNavBar';
import './StatisticsPage.css';

interface StatisticsPageProps {
  user: UserModel;
  workoutPlan: WorkoutPlan;
  feedbackHistory: UserFeedback[];
}

const StatisticsPage: React.FC<StatisticsPageProps> = ({ 
  user, 
  workoutPlan, 
  feedbackHistory 
}) => {
  // Generate progression level history from feedback
  // In a real application, this would come from the backend
  const [progressionLevels, setProgressionLevels] = useState<Array<{
    date: Date;
    level: ProgressionLevel;
  }>>([]);
  
  // Generate mock progression level history based on feedback
  useEffect(() => {
    if (feedbackHistory.length > 0) {
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
      
      // Generate progression levels based on feedback patterns
      const levels: Array<{ date: Date; level: ProgressionLevel }> = [];
      let prevLevel = ProgressionLevel.NormalProgress;
      
      Object.entries(feedbackByDate)
        .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
        .forEach(([dateStr, dateFeedback], index) => {
          // Average difficulty and enjoyment
          const avgDifficulty = dateFeedback.reduce((sum, fb) => sum + fb.difficulty, 0) / dateFeedback.length;
          const avgEnjoyment = dateFeedback.reduce((sum, fb) => sum + fb.enjoyment, 0) / dateFeedback.length;
          
          // Determine progression level based on feedback patterns
          let newLevel: ProgressionLevel;
          
          if (avgDifficulty > 4.5) {
            // Very difficult, might need to deload
            newLevel = Math.random() < 0.7 ? ProgressionLevel.Deload : ProgressionLevel.Maintenance;
          } else if (avgDifficulty > 4 && avgEnjoyment < 2.5) {
            // Difficult and not enjoyable
            newLevel = Math.random() < 0.6 ? ProgressionLevel.SlowProgress : ProgressionLevel.Maintenance;
          } else if (avgDifficulty < 2 && avgEnjoyment > 4) {
            // Too easy and enjoyable
            newLevel = Math.random() < 0.8 ? ProgressionLevel.FastProgress : ProgressionLevel.Breakthrough;
          } else if (avgDifficulty > 3 && avgDifficulty <= 4 && avgEnjoyment >= 3) {
            // Good challenge and enjoyable
            newLevel = Math.random() < 0.7 ? ProgressionLevel.ModerateProgress : ProgressionLevel.NormalProgress;
          } else {
            // Default case
            const options = [
              ProgressionLevel.SlowProgress,
              ProgressionLevel.NormalProgress,
              ProgressionLevel.ModerateProgress
            ];
            newLevel = options[Math.floor(Math.random() * options.length)];
          }
          
          // Occasionally add a deload week (every 4-6 weeks)
          if (index > 0 && index % (4 + Math.floor(Math.random() * 3)) === 0) {
            newLevel = ProgressionLevel.Deload;
          }
          
          // Sometimes maintain previous level for continuity
          if (Math.random() < 0.3 && index > 0) {
            newLevel = prevLevel;
          }
          
          levels.push({
            date: new Date(dateStr),
            level: newLevel
          });
          
          prevLevel = newLevel;
        });
      
      setProgressionLevels(levels);
    } else {
      // If no feedback, provide sample data
      const now = new Date();
      const sampleLevels = [];
      
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
          level = ProgressionLevel.ModerateProgress;
        }
        
        sampleLevels.push({
          date,
          level
        });
      }
      
      setProgressionLevels(sampleLevels);
    }
  }, [feedbackHistory]);
  
  return (
    <div className="statistics-page">
      <SimpleNavBar title="Workout Statistics" />
      
      <div className="page-content">
        <StatisticsDashboard 
          user={user}
          workoutPlan={workoutPlan}
          feedbackHistory={feedbackHistory}
          progressionLevels={progressionLevels}
        />
      </div>
    </div>
  );
};

export default StatisticsPage;