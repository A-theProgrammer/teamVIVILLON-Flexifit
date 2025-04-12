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
                
                {/* Additional Tabs for Feedback and Adaptation */}
                <WorkoutTabs 
                  tabTitles={['Submit Feedback', 'Adaptation']}
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