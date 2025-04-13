import React, { useState, useEffect } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import SimpleNavBar from './components/navigation/SimpleNavBar';
import UserProfileCard from './components/user/UserProfileCard';
import UserProfileForm from './components/user/UserProfileForm';
import UserMetricsDisplay from './components/user/UserMetricsDisplay';
import WorkoutPlanOverview from './components/workout/WorkoutPlanOverview';
import WorkoutDayList from './components/workout/WorkoutDayList';
import WorkoutFeedbackForm from './components/feedback/WorkoutFeedbackForm';
import AdaptiveChangesDisplay from './components/adaptation/AdaptiveChangesDisplay';
import ProgressionLevelIndicator from './components/adaptation/ProgressionLevelIndicator';
import TodayWorkout from './components/workout/TodayWorkout';
import WorkoutCalendar from './components/workout/WorkoutCalendar';
import SimulationControls from './components/simulation/SimulationControls';
import WorkoutTabs from './components/navigation/WorkoutTabs';
import StatisticsDashboard from './components/statistics/StatisticsDashboard'; // 导入统计仪表盘
import { ProgressionLevel, UserFeedback } from './adaptiveEngine/types';
import { UserModel } from './types/user';
import './App.css';

const AppContent: React.FC = () => {
  const {
    user,
    setUser,
    workoutPlan,
    feedbackHistory,
    addFeedback,
    generateNewPlan,
    adaptCurrentPlan,
    adaptiveChanges,
    isLoading,
    currentDate,
    setCurrentDate,
    feedbackNeeded
  } = useAppContext();

  // State for user profile editing
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  // State for workout view
  const [selectedWorkoutView, setSelectedWorkoutView] = useState<'today' | 'week' | 'calendar'>('today');
  
  // State to track adaptation status
  const [adaptationInProgress, setAdaptationInProgress] = useState(false);
  const [lastAdaptationTime, setLastAdaptationTime] = useState<Date | null>(null);
  const [adaptationFeedbackTab, setAdaptationFeedbackTab] = useState(false);

  // 添加进展水平历史数据状态
  const [progressionLevels, setProgressionLevels] = useState<Array<{
    date: Date;
    level: ProgressionLevel;
  }>>([]);

  // 生成进展水平历史数据
  useEffect(() => {
    if (feedbackHistory.length > 0) {
      // 基于反馈历史生成进展水平数据
      const levels: Array<{ date: Date; level: ProgressionLevel }> = [];
      let prevLevel = ProgressionLevel.NormalProgress;
      
      // 按日期分组反馈
      const feedbackByDate: Record<string, UserFeedback[]> = {};
      
      feedbackHistory.forEach(feedback => {
        const date = new Date(feedback.completionTime);
        const dateKey = date.toISOString().split('T')[0];
        
        if (!feedbackByDate[dateKey]) {
          feedbackByDate[dateKey] = [];
        }
        
        feedbackByDate[dateKey].push(feedback);
      });
      
      // 基于反馈模式生成进展水平
      Object.entries(feedbackByDate)
        .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
        .forEach(([dateStr, dateFeedback], index) => {
          // 计算平均难度和愉悦度
          const avgDifficulty = dateFeedback.reduce((sum, fb) => sum + fb.difficulty, 0) / dateFeedback.length;
          const avgEnjoyment = dateFeedback.reduce((sum, fb) => sum + fb.enjoyment, 0) / dateFeedback.length;
          
          // 根据反馈模式确定进展水平
          let newLevel: ProgressionLevel;
          
          if (avgDifficulty > 4.5) {
            // 非常困难，可能需要减负
            newLevel = Math.random() < 0.7 ? ProgressionLevel.Deload : ProgressionLevel.Maintenance;
          } else if (avgDifficulty > 4 && avgEnjoyment < 2.5) {
            // 困难且不愉快
            newLevel = Math.random() < 0.6 ? ProgressionLevel.SlowProgress : ProgressionLevel.Maintenance;
          } else if (avgDifficulty < 2 && avgEnjoyment > 4) {
            // 太容易且愉快
            newLevel = Math.random() < 0.8 ? ProgressionLevel.FastProgress : ProgressionLevel.Breakthrough;
          } else if (avgDifficulty > 3 && avgDifficulty <= 4 && avgEnjoyment >= 3) {
            // 有适当挑战且愉快
            newLevel = Math.random() < 0.7 ? ProgressionLevel.ModerateProgress : ProgressionLevel.NormalProgress;
          } else {
            // 默认情况
            const options = [
              ProgressionLevel.SlowProgress,
              ProgressionLevel.NormalProgress,
              ProgressionLevel.ModerateProgress
            ];
            newLevel = options[Math.floor(Math.random() * options.length)];
          }
          
          // 定期添加减负周（每4-6周）
          if (index > 0 && index % (4 + Math.floor(Math.random() * 3)) === 0) {
            newLevel = ProgressionLevel.Deload;
          }
          
          // 有时保持前一级别以保持连续性
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
      // 如果没有反馈，提供示例数据
      const now = new Date();
      const sampleLevels = [];
      
      for (let i = 30; i >= 0; i -= 3) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        
        // 模拟典型的进展模式
        let level: ProgressionLevel;
        
        if (i > 25) {
          level = ProgressionLevel.SlowProgress;
        } else if (i > 18) {
          level = ProgressionLevel.NormalProgress;
        } else if (i > 15) {
          level = ProgressionLevel.Deload; // 减负周
        } else if (i > 10) {
          level = ProgressionLevel.Maintenance;
        } else if (i > 6) {
          level = ProgressionLevel.ModerateProgress;
        } else if (i > 3) {
          level = ProgressionLevel.FastProgress;
        } else {
          level = getCurrentProgressionLevel();
        }
        
        sampleLevels.push({
          date,
          level
        });
      }
      
      setProgressionLevels(sampleLevels);
    }
  }, [feedbackHistory]);

  // Monitor feedback history and trigger adaptation when needed
  useEffect(() => {
    if (feedbackHistory.length > 0 && feedbackNeeded) {
      // Set adaptation in progress
      setAdaptationInProgress(true);
      
      // Allow some time for animation before triggering adaptation
      const timer = setTimeout(() => {
        // Adapt the plan
        adaptCurrentPlan();
        
        // Update adaptation status
        setAdaptationInProgress(false);
        setLastAdaptationTime(new Date());
        
        // Briefly show the adaptation tab to highlight changes
        setAdaptationFeedbackTab(true);
        
        // Reset the feedback tab after a delay
        setTimeout(() => {
          setAdaptationFeedbackTab(false);
        }, 5000);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [feedbackHistory, feedbackNeeded]);

  // Handle updating user with simulated time passage
  const handleSimulateTime = (days: number) => {
    if (!user) return;

    const updatedUser = { ...user };
    
    // Create a new date object from the current date and add days
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
    
    // Update last workout date
    if (updatedUser.dynamicAttributes.workoutProgress) {
      const lastWorkoutDate = new Date(updatedUser.dynamicAttributes.workoutProgress.lastWorkout);
      lastWorkoutDate.setDate(lastWorkoutDate.getDate() + days);
      updatedUser.dynamicAttributes.workoutProgress.lastWorkout = lastWorkoutDate.toISOString();
      
      // Simulate streaks (randomly decrease for realism)
      const streakDays = updatedUser.dynamicAttributes.workoutProgress.streakDays;
      if (Math.random() > 0.7) {
        // 30% chance of breaking streak
        updatedUser.dynamicAttributes.workoutProgress.streakDays = Math.floor(streakDays * 0.5);
      } else {
        // Otherwise increase streak by some days (not necessarily all simulated days)
        const daysToAdd = Math.floor(days * (0.7 + Math.random() * 0.3));
        updatedUser.dynamicAttributes.workoutProgress.streakDays = streakDays + daysToAdd;
      }
    }
    
    setUser(updatedUser);
  };

  // Handle user profile update
  const handleUserProfileUpdate = (updatedUser: UserModel) => {
    setUser(updatedUser);
    setIsEditingProfile(false);
  };

  // Determine current progression level from adaptive changes or default
  const getCurrentProgressionLevel = (): ProgressionLevel => {
    if (adaptiveChanges) {
      const progressValue = adaptiveChanges.parameters.progression;
      return progressValue;
    }
    return ProgressionLevel.NormalProgress; // Default value
  };

  // Handle workout start
  const handleStartWorkout = () => {
    console.log('Starting workout...');
    // Additional logic if needed
  };

  // Render workout view based on selected tab
  const renderWorkoutView = () => {
    if (!workoutPlan) return null;

    switch (selectedWorkoutView) {
      case 'today':
        return <TodayWorkout workoutPlan={workoutPlan} onStartWorkout={handleStartWorkout} />;
      case 'week':
        return <WorkoutDayList workoutPlan={workoutPlan} />;
      case 'calendar':
        return <WorkoutCalendar workoutPlan={workoutPlan} />;
      default:
        return <TodayWorkout workoutPlan={workoutPlan} onStartWorkout={handleStartWorkout} />;
    }
  };

  return (
    <div className="app-container">
      <SimpleNavBar title="Adaptive Workout System" />
      
      <main className="main-content">
        {/* Simulation Controls (for demo) */}
        <section className="app-section">
          <SimulationControls
            onGenerateUser={(user: UserModel) => setUser(user)}
            onSimulateFeedback={(feedback: UserFeedback) => addFeedback(feedback)}
            onSimulateTime={handleSimulateTime}
          />
        </section>
        
        {/* User Profile Section */}
        {user && (
          <section className="app-section user-section">
            <div className="user-profile">
              <UserProfileCard 
                user={user} 
                onEditClick={() => setIsEditingProfile(true)} 
              />
            </div>
            <div className="user-metrics">
              <UserMetricsDisplay user={user} feedbackHistory={feedbackHistory} />
            </div>
          </section>
        )}
        
        {/* User Profile Editing Form */}
        {isEditingProfile && user && (
          <UserProfileForm 
            user={user} 
            onSave={handleUserProfileUpdate} 
            onCancel={() => setIsEditingProfile(false)} 
          />
        )}
        
        {/* Workout Plan Section */}
        {workoutPlan && (
          <section className="app-section">
            <WorkoutPlanOverview
              workoutPlan={workoutPlan}
              onGenerateNewPlan={generateNewPlan}
              adaptationInProgress={adaptationInProgress}
              lastAdaptationTime={lastAdaptationTime}
            />
            
            {/* Workout View Tabs */}
            <div className="workout-view-tabs">
              <button 
                className={`view-tab ${selectedWorkoutView === 'today' ? 'active' : ''}`}
                onClick={() => setSelectedWorkoutView('today')}
              >
                Today
              </button>
              <button 
                className={`view-tab ${selectedWorkoutView === 'week' ? 'active' : ''}`}
                onClick={() => setSelectedWorkoutView('week')}
              >
                Weekly Schedule
              </button>
              <button 
                className={`view-tab ${selectedWorkoutView === 'calendar' ? 'active' : ''}`}
                onClick={() => setSelectedWorkoutView('calendar')}
              >
                Calendar
              </button>
            </div>
            
            {isLoading ? (
              <div className="loading-indicator">
                <p>Processing your workout data...</p>
              </div>
            ) : (
              <>
                {/* Dynamic Workout View */}
                <div className="workout-view-container">
                  {renderWorkoutView()}
                </div>
                
                {/* 扩展标签页，增加统计标签 */}
                <WorkoutTabs 
                  tabTitles={['Submit Feedback', 'Adaptation', 'Statistics']}
                  initialTabIndex={adaptationFeedbackTab ? 1 : 0}
                >
                  {/* Tab 1: Feedback */}
                  <div className="tab-panel">
                    <WorkoutFeedbackForm
                      workoutPlan={workoutPlan}
                      onSubmitFeedback={addFeedback}
                    />
                  </div>
                  
                  {/* Tab 2: Adaptation */}
                  <div className="tab-panel">
                    <ProgressionLevelIndicator progressionLevel={getCurrentProgressionLevel()} />
                    <AdaptiveChangesDisplay changes={adaptiveChanges} />
                  </div>
                  
                  {/* Tab 3: Statistics - 新增 */}
                  <div className="tab-panel">
                  {user ? (
                    <StatisticsDashboard 
                      user={user}
                      workoutPlan={workoutPlan}
                      feedbackHistory={feedbackHistory}
                      progressionLevels={progressionLevels}
                    />
                  ) : (
                    <div className="empty-chart-message">
                      <p>No user data available. Please create a user profile first.</p>
                    </div>
                  )}
                </div>
                </WorkoutTabs>
              </>
            )}
          </section>
        )}
        
        {/* Show call to action if no workout plan */}
        {user && !workoutPlan && (
          <section className="app-section">
            <div className="cta-card">
              <h2>Get Started with Your Workout Plan</h2>
              <p>Generate your personalized workout plan based on your profile and goals.</p>
              <button className="cta-button" onClick={generateNewPlan}>
                Generate Workout Plan
              </button>
            </div>
          </section>
        )}
        
        {/* Show initial welcome if no user */}
        {!user && (
          <section className="app-section">
            <div className="welcome-card">
              <h2>Welcome to the Adaptive Workout System</h2>
              <p>
                This demo showcases an adaptive workout strategy algorithm that creates
                personalized workout plans and adjusts them based on user feedback and progress.
              </p>
              <p>
                Use the simulation controls above to generate a demo user and interact with the system,
                or create your own custom user profile.
              </p>
            </div>
          </section>
        )}
      </main>
      
      <footer className="app-footer">
        <p>Adaptive Workout System Demo - Student Project</p>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;