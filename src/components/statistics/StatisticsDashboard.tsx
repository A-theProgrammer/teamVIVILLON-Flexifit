import React, { useState, useMemo } from 'react';
import { UserModel, WorkoutPlan } from '../../types/user';
import { UserFeedback, ProgressionLevel } from '../../adaptiveEngine/types';
import WorkoutCompletionChart from './charts/WorkoutCompletionChart';
import BodyPartDistributionChart from './charts/BodyPartDistributionChart';
import FeedbackTrendChart from './charts/FeedbackTrendChart';
import ProgressionLevelChart from './charts/ProgressionLevelChart';
import StreakTrendChart from './charts/StreakTrendChart';
import './StatisticsDashboard.css';

interface StatisticsDashboardProps {
  user: UserModel;
  workoutPlan: WorkoutPlan;
  feedbackHistory: UserFeedback[];
  progressionLevels?: { date: Date; level: ProgressionLevel }[];
}

type TimeRange = '7d' | '30d' | '90d' | 'all';

const StatisticsDashboard: React.FC<StatisticsDashboardProps> = ({ 
  user, 
  workoutPlan, 
  feedbackHistory,
  progressionLevels = []
}) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('30d');
  const [activeChartIndex, setActiveChartIndex] = useState<number | null>(null);
  
  // Filter data based on selected time range
  const filteredData = useMemo(() => {
    const now = new Date();
    const cutoffDate = new Date();
    
    switch (selectedTimeRange) {
      case '7d':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        cutoffDate.setDate(now.getDate() - 90);
        break;
      case 'all':
        cutoffDate.setFullYear(2000); // Far enough in the past
        break;
    }
    
    return {
      feedback: feedbackHistory.filter(feedback => 
        new Date(feedback.completionTime).getTime() >= cutoffDate.getTime()
      ),
      progressionLevels: progressionLevels.filter(item => 
        item.date.getTime() >= cutoffDate.getTime()
      )
    };
  }, [feedbackHistory, progressionLevels, selectedTimeRange]);

  // Get streak data
  const streakData = useMemo(() => {
    if (!user.dynamicAttributes?.workoutProgress) {
      return { current: 0, history: [] };
    }
    
    // This is a placeholder - in a real app, you'd have a history of streaks
    // For now, we'll generate some mock data based on the current streak
    const currentStreak = user.dynamicAttributes.workoutProgress.streakDays || 0;
    
    // Generate mock streak history for demonstration
    const mockHistory = [];
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() - 30); // Start 30 days ago
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(baseDate);
      date.setDate(date.getDate() + i);
      
      // Generate a somewhat realistic streak progression
      let streakValue;
      if (i < 10) {
        streakValue = Math.min(currentStreak, Math.floor(i / 2) + 1);
      } else if (i < 20) {
        // Add a streak break around day 15
        streakValue = i >= 15 && i <= 17 ? 0 : Math.min(currentStreak, i - 5);
      } else {
        // Build back up to current
        streakValue = Math.min(currentStreak, i - 15);
      }
      
      mockHistory.push({
        date,
        value: streakValue
      });
    }
    
    return {
      current: currentStreak,
      history: mockHistory
    };
  }, [user]);

  // Handle time range change
  const handleTimeRangeChange = (range: TimeRange) => {
    setSelectedTimeRange(range);
  };

  // Handle chart expansion/collapse
  const toggleChartExpansion = (index: number) => {
    if (activeChartIndex === index) {
      setActiveChartIndex(null);
    } else {
      setActiveChartIndex(index);
    }
  };

  // Calculate overall statistics
  const overallStats = useMemo(() => {
    const workoutCount = feedbackHistory.length || 0;
    const avgDifficulty = feedbackHistory.length 
      ? feedbackHistory.reduce((sum, fb) => sum + fb.difficulty, 0) / feedbackHistory.length 
      : 0;
    const avgEnjoyment = feedbackHistory.length 
      ? feedbackHistory.reduce((sum, fb) => sum + fb.enjoyment, 0) / feedbackHistory.length 
      : 0;
    
    // Calculate completion rate
    const completedExercises = user.dynamicAttributes?.workoutProgress?.completedExercises?.length || 0;
    
    // Calculate unique workout days
    const uniqueDays = new Set(
      feedbackHistory.map(feedback => 
        new Date(feedback.completionTime).toDateString()
      )
    ).size;
    
    return {
      totalWorkouts: workoutCount,
      averageDifficulty: avgDifficulty.toFixed(1),
      averageEnjoyment: avgEnjoyment.toFixed(1),
      completedExercises,
      uniqueWorkoutDays: uniqueDays
    };
  }, [feedbackHistory, user]);

  return (
    <div className="statistics-dashboard">
      <div className="dashboard-header">
        <h2>Fitness Analytics Dashboard</h2>
        <p>Track your workout progress and see how your training adapts to your performance.</p>
        
        <div className="time-range-selector">
          <span className="range-label">Time Range:</span>
          <div className="range-buttons">
            <button 
              className={`range-button ${selectedTimeRange === '7d' ? 'active' : ''}`}
              onClick={() => handleTimeRangeChange('7d')}
            >
              7 Days
            </button>
            <button 
              className={`range-button ${selectedTimeRange === '30d' ? 'active' : ''}`}
              onClick={() => handleTimeRangeChange('30d')}
            >
              30 Days
            </button>
            <button 
              className={`range-button ${selectedTimeRange === '90d' ? 'active' : ''}`}
              onClick={() => handleTimeRangeChange('90d')}
            >
              90 Days
            </button>
            <button 
              className={`range-button ${selectedTimeRange === 'all' ? 'active' : ''}`}
              onClick={() => handleTimeRangeChange('all')}
            >
              All Time
            </button>
          </div>
        </div>
      </div>
      
      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-value">{overallStats.totalWorkouts}</div>
          <div className="stat-label">Total Workouts</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{overallStats.uniqueWorkoutDays}</div>
          <div className="stat-label">Workout Days</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{overallStats.completedExercises}</div>
          <div className="stat-label">Exercises Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{overallStats.averageDifficulty}/5</div>
          <div className="stat-label">Avg Difficulty</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{streakData.current}</div>
          <div className="stat-label">Current Streak</div>
        </div>
      </div>
      
      <div className="charts-grid">
        {/* Chart 1: Workout Completion */}
        <div 
          className={`chart-container ${activeChartIndex === 0 ? 'expanded' : ''}`}
          onClick={() => toggleChartExpansion(0)}
        >
          <div className="chart-header">
            <h3>Workout Completion Trend</h3>
            <button className="expand-button">
              {activeChartIndex === 0 ? '−' : '+'}
            </button>
          </div>
          <div className="chart-content">
            <WorkoutCompletionChart 
              feedbackHistory={filteredData.feedback} 
              timeRange={selectedTimeRange}
            />
          </div>
        </div>
        
        {/* Chart 2: Body Part Distribution */}
        <div 
          className={`chart-container ${activeChartIndex === 1 ? 'expanded' : ''}`}
          onClick={() => toggleChartExpansion(1)}
        >
          <div className="chart-header">
            <h3>Body Part Training Distribution</h3>
            <button className="expand-button">
              {activeChartIndex === 1 ? '−' : '+'}
            </button>
          </div>
          <div className="chart-content">
            <BodyPartDistributionChart 
              workoutPlan={workoutPlan} 
              feedbackHistory={filteredData.feedback} 
            />
          </div>
        </div>
        
        {/* Chart 3: Feedback Trend */}
        <div 
          className={`chart-container ${activeChartIndex === 2 ? 'expanded' : ''}`}
          onClick={() => toggleChartExpansion(2)}
        >
          <div className="chart-header">
            <h3>Workout Feedback Analysis</h3>
            <button className="expand-button">
              {activeChartIndex === 2 ? '−' : '+'}
            </button>
          </div>
          <div className="chart-content">
            <FeedbackTrendChart 
              feedbackHistory={filteredData.feedback} 
              timeRange={selectedTimeRange}
            />
          </div>
        </div>
        
        {/* Chart 4: Progression Level */}
        <div 
          className={`chart-container ${activeChartIndex === 3 ? 'expanded' : ''}`}
          onClick={() => toggleChartExpansion(3)}
        >
          <div className="chart-header">
            <h3>Progression Level Changes</h3>
            <button className="expand-button">
              {activeChartIndex === 3 ? '−' : '+'}
            </button>
          </div>
          <div className="chart-content">
            <ProgressionLevelChart 
              progressionLevels={filteredData.progressionLevels} 
              timeRange={selectedTimeRange}
            />
          </div>
        </div>
        
        {/* Chart 5: Workout Streak */}
        <div 
          className={`chart-container ${activeChartIndex === 4 ? 'expanded' : ''}`}
          onClick={() => toggleChartExpansion(4)}
        >
          <div className="chart-header">
            <h3>Workout Streak Trend</h3>
            <button className="expand-button">
              {activeChartIndex === 4 ? '−' : '+'}
            </button>
          </div>
          <div className="chart-content">
            <StreakTrendChart 
              streakData={streakData.history} 
              timeRange={selectedTimeRange}
            />
          </div>
        </div>
      </div>
      
      <div className="dashboard-footer">
        <button className="export-button">
          Export Data
        </button>
        <p className="data-note">
          Note: Stats are based on {filteredData.feedback.length} feedback entries over the selected time period.
        </p>
      </div>
    </div>
  );
};

export default StatisticsDashboard;