import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserModel, WorkoutPlan } from '../types/user';
import { AdaptiveEngineService } from '../services/AdaptiveEngineService';
import { WorkoutGeneratorService } from '../services/WorkoutGeneratorService';
import { ConversationState } from '../types/chat';
import { UserFeedback } from '../adaptiveEngine/types';

// Define the context shape
interface AppContextType {
  user: UserModel | null;
  setUser: (user: UserModel) => void;
  workoutPlan: WorkoutPlan | null;
  setWorkoutPlan: (plan: WorkoutPlan) => void;
  feedbackHistory: UserFeedback[];
  addFeedback: (feedback: UserFeedback) => void;
  generateNewPlan: () => void;
  adaptCurrentPlan: () => void;
  adaptiveChanges: any | null;
  setAdaptiveChanges: (changes: any) => void;
  conversionState: ConversationState;
  updateConversationState: (updates: Partial<ConversationState>) => void;
  isLoading: boolean;
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  feedbackNeeded: boolean;
  setFeedbackNeeded: (needed: boolean) => void;
  updateCompletedExercises: (newCompletedExercises: string[]) => void;
}

// Create default conversation state
const defaultConversationState: ConversationState = {
  step: 0,
  userName: '',
  forWhom: 'self',
  askedQuestions: new Set<string>(),
  timeAvailable: 60,
  injuries: [],
  healthConditions: [],
  targetBodyAreas: []
};

// Create initial user for demo purposes
const initialUser: UserModel = {
  userId: 'demo-user-' + Date.now(),
  staticAttributes: {
    basicInformation: {
      age: 30,
      gender: 'male',
      height: 175,
      weight: 75,
      name: 'Demo User',
      location: 'Demo City',
      email: 'demo@example.com'
    },
    fitnessGoals: {
      primaryGoal: 'general_health',
    },
    exerciseBackground: {
      experienceLevel: 'intermediate',
      currentExerciseHabits: {
        frequencyPerWeek: 3,
        sessionDuration: 60
      }
    }
  },
  dynamicAttributes: {
    trainingData: [],
    workoutProgress: {
      completedExercises: [],
      lastWorkout: new Date().toISOString(),
      streakDays: 0
    },
    savedWorkoutPlans: []
  }
};

// Create context with default values
const AppContext = createContext<AppContextType>({
  user: null,
  setUser: () => {},
  workoutPlan: null,
  setWorkoutPlan: () => {},
  feedbackHistory: [],
  addFeedback: () => {},
  generateNewPlan: () => {},
  adaptCurrentPlan: () => {},
  adaptiveChanges: null,
  setAdaptiveChanges: () => {},
  conversionState: defaultConversationState,
  updateConversationState: () => {},
  isLoading: false,
  currentDate: new Date(),
  setCurrentDate: () => {},
  feedbackNeeded: false,
  setFeedbackNeeded: () => {},
  updateCompletedExercises: () => {}
});

// Create provider component
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State hooks
  const [user, setUser] = useState<UserModel | null>(null);
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [feedbackHistory, setFeedbackHistory] = useState<UserFeedback[]>([]);
  const [adaptiveChanges, setAdaptiveChanges] = useState<any | null>(null);
  const [conversionState, setConversionState] = useState<ConversationState>(defaultConversationState);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [feedbackNeeded, setFeedbackNeeded] = useState<boolean>(false);
  const [adaptationTimer, setAdaptationTimer] = useState<NodeJS.Timeout | null>(null);

  // Initialize services
  const adaptiveEngineService = new AdaptiveEngineService();
  const workoutGeneratorService = new WorkoutGeneratorService();

  // Initialize user from localStorage or use default
  useEffect(() => {
    const savedUser = localStorage.getItem('workout-app-user');
    const savedFeedback = localStorage.getItem('workout-app-feedback');
    const savedPlan = localStorage.getItem('workout-app-plan');
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      setUser(initialUser);
      localStorage.setItem('workout-app-user', JSON.stringify(initialUser));
    }
    
    if (savedFeedback) {
      setFeedbackHistory(JSON.parse(savedFeedback));
    }
    
    if (savedPlan) {
      setWorkoutPlan(JSON.parse(savedPlan));
    }
  }, []);

  // Save user to localStorage when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('workout-app-user', JSON.stringify(user));
    }
  }, [user]);

  // Save feedback to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('workout-app-feedback', JSON.stringify(feedbackHistory));
  }, [feedbackHistory]);

  // Save workout plan to localStorage when it changes
  useEffect(() => {
    if (workoutPlan) {
      localStorage.setItem('workout-app-plan', JSON.stringify(workoutPlan));
    }
  }, [workoutPlan]);

  // Auto-adapt after user provides feedback
  useEffect(() => {
    if (feedbackHistory.length > 0 && workoutPlan && user) {
      // Clear previous timer if it exists
      if (adaptationTimer) {
        clearTimeout(adaptationTimer);
      }
      
      // Set a timer to trigger adaptation after a delay
      // This allows multiple feedback entries to be batched
      const timer = setTimeout(() => {
        adaptCurrentPlan();
      }, 3000); // 3 second delay
      
      setAdaptationTimer(timer);
    }
    
    return () => {
      if (adaptationTimer) {
        clearTimeout(adaptationTimer);
      }
    };
  }, [feedbackHistory]);

  // Add new feedback
  const addFeedback = (feedback: UserFeedback) => {
    setFeedbackHistory(prev => {
      const updated = [...prev, feedback];
      return updated;
    });
    
    // Reset feedback needed flag
    setFeedbackNeeded(false);
  };

  // Update conversation state
  const updateConversationState = (updates: Partial<ConversationState>) => {
    setConversionState(prev => ({ ...prev, ...updates }));
  };

  // Generate a new workout plan
  const generateNewPlan = () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      // Generate new workout plan using the workout generator
      const newPlan = workoutGeneratorService.generatePlan(
        conversionState,
        user.staticAttributes.fitnessGoals.primaryGoal,
        user.staticAttributes.exerciseBackground.experienceLevel,
        user,
        workoutPlan,
        feedbackHistory
      );
      
      setWorkoutPlan(newPlan);
      
      // Update user's saved plans
      if (user) {
        const updatedUser = { ...user };
        if (!updatedUser.dynamicAttributes.savedWorkoutPlans) {
          updatedUser.dynamicAttributes.savedWorkoutPlans = [];
        }
        updatedUser.dynamicAttributes.savedWorkoutPlans.push(newPlan);
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('Error generating workout plan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Adapt the current workout plan
  const adaptCurrentPlan = () => {
    if (!user || !workoutPlan) return;
    
    setIsLoading(true);
    
    try {
      // Generate adaptive plan
      const adaptedPlan = adaptiveEngineService.generateAdaptivePlan(
        user,
        workoutPlan,
        feedbackHistory
      );
      
      // Get the changes
      const changes = adaptiveEngineService.getLastAdaptiveChanges();
      setAdaptiveChanges(changes);
      
      // Set the new plan
      setWorkoutPlan(adaptedPlan);
      
      // Update user's saved plans
      if (user) {
        const updatedUser = { ...user };
        if (!updatedUser.dynamicAttributes.savedWorkoutPlans) {
          updatedUser.dynamicAttributes.savedWorkoutPlans = [];
        }
        updatedUser.dynamicAttributes.savedWorkoutPlans.push(adaptedPlan);
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('Error adapting workout plan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateCompletedExercises = (newCompletedExercises: string[]) => {
    if (!user) return;
    
    const updatedUser = { ...user };
    if (!updatedUser.dynamicAttributes.workoutProgress) {
      updatedUser.dynamicAttributes.workoutProgress = {
        completedExercises: [],
        lastWorkout: new Date().toISOString(),
        streakDays: 0
      };
    }
    
    // 添加新的完成练习到数组
    updatedUser.dynamicAttributes.workoutProgress.completedExercises = [
      ...updatedUser.dynamicAttributes.workoutProgress.completedExercises,
      ...newCompletedExercises
    ];
    
    setUser(updatedUser);
  };

  // Context value
  const contextValue: AppContextType = {
    user,
    setUser,
    workoutPlan,
    setWorkoutPlan,
    feedbackHistory,
    addFeedback,
    generateNewPlan,
    adaptCurrentPlan,
    adaptiveChanges,
    setAdaptiveChanges,
    conversionState,
    updateConversationState,
    isLoading,
    currentDate,
    setCurrentDate,
    feedbackNeeded,
    setFeedbackNeeded,
    updateCompletedExercises
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook for using the context
export const useAppContext = () => useContext(AppContext);