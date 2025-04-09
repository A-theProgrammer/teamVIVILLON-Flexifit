// src/contexts/UserContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserModel, WorkoutPlan } from '@/types/user';
import { toast } from 'sonner';
import { AdaptiveEngine } from '@/adaptiveEngine/AdaptiveEngine';

type UserContextType = {
  user: UserModel | null;
  currentPlan: WorkoutPlan | null;
  workoutPlans: WorkoutPlan[];
  completedExercises: string[];
  feedbackHistory: any[];
  setUser: (user: UserModel) => void;
  updateUser: (updates: Partial<UserModel>) => void;
  savePlan: (plan: WorkoutPlan) => void;
  deletePlan: () => void;
  isAuthenticated: boolean;
  login: (userId: string) => void;
  logout: () => void;
  toggleExerciseCompletion: (exerciseId: string, completed: boolean) => void;
  submitExerciseFeedback: (feedback: any) => void;
  updateHealthStatus: (healthStatus: {
    affectedAreas: string[];
    description: string;
    severity: string;
    reportedDate: string;
  }) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

// Generate a random user ID for demo purposes
const generateUserId = () => `user_${Math.random().toString(36).substring(2, 15)}`;

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<UserModel | null>(null);
  const [currentPlan, setCurrentPlan] = useState<WorkoutPlan | null>(null);
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const [feedbackHistory, setFeedbackHistory] = useState<any[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Initialize or load from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('flexifit_user');
    const storedPlan = localStorage.getItem('flexifit_current_plan');
    const storedPlans = localStorage.getItem('flexifit_workout_plans');
    const storedExercises = localStorage.getItem('flexifit_completed_exercises');
    const storedFeedback = localStorage.getItem('flexifit_feedback_history');
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUserState(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
      }
    }
    
    if (storedPlan) {
      try {
        const parsedPlan = JSON.parse(storedPlan);
        setCurrentPlan(parsedPlan);
      } catch (error) {
        console.error('Error parsing stored plan data:', error);
      }
    }

    if (storedPlans) {
      try {
        const parsedPlans = JSON.parse(storedPlans);
        setWorkoutPlans(parsedPlans);
      } catch (error) {
        console.error('Error parsing stored workout plans:', error);
      }
    }

    if (storedExercises) {
      try {
        const parsedExercises = JSON.parse(storedExercises);
        setCompletedExercises(parsedExercises);
      } catch (error) {
        console.error('Error parsing completed exercises:', error);
      }
    }
    
    if (storedFeedback) {
      try {
        const parsedFeedback = JSON.parse(storedFeedback);
        setFeedbackHistory(parsedFeedback);
      } catch (error) {
        console.error('Error parsing stored feedback data:', error);
      }
    }
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('flexifit_user', JSON.stringify(user));
    }
  }, [user]);

  useEffect(() => {
    if (currentPlan) {
      localStorage.setItem('flexifit_current_plan', JSON.stringify(currentPlan));
    } else if (currentPlan === null && localStorage.getItem('flexifit_current_plan')) {
      localStorage.removeItem('flexifit_current_plan');
    }
  }, [currentPlan]);

  useEffect(() => {
    localStorage.setItem('flexifit_workout_plans', JSON.stringify(workoutPlans));
  }, [workoutPlans]);

  useEffect(() => {
    localStorage.setItem('flexifit_completed_exercises', JSON.stringify(completedExercises));
  }, [completedExercises]);
  
  useEffect(() => {
    if (feedbackHistory.length > 0) {
      localStorage.setItem('flexifit_feedback_history', JSON.stringify(feedbackHistory));
    }
  }, [feedbackHistory]);

  const setUser = (userData: UserModel) => {
    setUserState(userData);
    setIsAuthenticated(true);
    toast.success('User profile updated!');
  };

  const updateUser = (updates: Partial<UserModel>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUserState(updatedUser);
      toast.success('Profile successfully updated');
    }
  };

  const savePlan = (plan: WorkoutPlan) => {
    // Check if we already have this plan (by ID)
    const existingPlanIndex = workoutPlans.findIndex(p => p.id === plan.id);
    
    if (existingPlanIndex >= 0) {
      // Update existing plan
      const updatedPlans = [...workoutPlans];
      updatedPlans[existingPlanIndex] = plan;
      setWorkoutPlans(updatedPlans);
    } else {
      // Add new plan
      setWorkoutPlans(prev => [...prev, plan]);
    }
    
    // Set as current plan
    setCurrentPlan(plan);
    toast.success('Workout plan saved!');
  };

  const deletePlan = () => {
    if (currentPlan) {
      setWorkoutPlans(prev => prev.filter(p => p.id !== currentPlan.id));
      setCurrentPlan(null);
      toast.success('Workout plan deleted');
    }
  };

  const toggleExerciseCompletion = (exerciseId: string, completed: boolean) => {
    if (completed) {
      // Add to completed exercises
      setCompletedExercises(prev => [...prev, exerciseId]);
      
      // Update user stats
      if (user) {
        const now = new Date().toISOString();
        const updatedUser = {
          ...user,
          dynamicAttributes: {
            ...user.dynamicAttributes,
            workoutProgress: {
              ...user.dynamicAttributes.workoutProgress,
              completedExercises: [...(user.dynamicAttributes.workoutProgress?.completedExercises || []), exerciseId],
              lastWorkout: now,
              streakDays: (user.dynamicAttributes.workoutProgress?.streakDays || 0) + 1
            }
          }
        };
        setUserState(updatedUser);
      }
    } else {
      // Remove from completed exercises
      setCompletedExercises(prev => prev.filter(id => id !== exerciseId));
      
      // Update user stats
      if (user && user.dynamicAttributes.workoutProgress) {
        const updatedUser = {
          ...user,
          dynamicAttributes: {
            ...user.dynamicAttributes,
            workoutProgress: {
              ...user.dynamicAttributes.workoutProgress,
              completedExercises: user.dynamicAttributes.workoutProgress.completedExercises.filter(id => id !== exerciseId),
              // Decrease streak if applicable
              streakDays: Math.max(0, (user.dynamicAttributes.workoutProgress.streakDays || 1) - 1)
            }
          }
        };
        setUserState(updatedUser);
      }
    }
  };
  
  // Add exercise feedback
  const submitExerciseFeedback = (feedback: any) => {
    const newFeedback = {
      ...feedback,
      timestamp: new Date().toISOString()
    };
    
    setFeedbackHistory(prev => [...prev, newFeedback]);
    toast.success('Feedback recorded, your next plan will be adjusted accordingly');
  };
  
  // Update health status
  const updateHealthStatus = (healthStatus: any) => {
    if (user) {
      // Update user with new health status
      const updatedUser = {
        ...user,
        staticAttributes: {
          ...user.staticAttributes,
          basicInformation: {
            ...user.staticAttributes.basicInformation,
            healthStatus: [
              ...(user.staticAttributes.basicInformation.healthStatus || []),
              healthStatus
            ]
          }
        }
      };
      
      setUserState(updatedUser);
      toast.success('Health information updated. Your workout plans will be adjusted accordingly');
      
      // If there's a current plan, trigger an immediate plan update
      if (currentPlan) {
        try {
          // Create new plan with health status consideration
          const adaptiveEngine = new AdaptiveEngine();
          const adjustedPlan = adaptiveEngine.generateAdaptiveWorkoutPlan(
            updatedUser,
            currentPlan,
            feedbackHistory
          );
          
          // Update current plan
          setCurrentPlan(adjustedPlan);
          toast.info('Your workout plan has been adjusted to accommodate your limitations');
        } catch (error) {
          console.error('Failed to adjust plan for health status', error);
        }
      }
    }
  };

  const login = (userId: string = generateUserId()) => {
    // Create basic user structure if not exists
    const newUser: UserModel = {
      userId,
      staticAttributes: {
        basicInformation: {
          age: 0,
          gender: 'other',
          height: 0,
          weight: 0,
          name: 'User',
          location: 'Unknown',
        },
        fitnessGoals: {
          primaryGoal: 'general_health',
        },
        exerciseBackground: {
          experienceLevel: 'beginner',
          currentExerciseHabits: {
            frequencyPerWeek: 0,
            sessionDuration: 0,
          },
        },
      },
      dynamicAttributes: {
        trainingData: [],
        workoutProgress: {
          completedExercises: [],
          lastWorkout: '',
          streakDays: 0
        },
        savedWorkoutPlans: []
      },
    };
    
    // If we already have a user, keep their existing data
    if (user) {
      setIsAuthenticated(true);
    } else {
      setUserState(newUser);
      setIsAuthenticated(true);
    }
    toast.success('Logged in successfully!');
  };

  const logout = () => {
    localStorage.removeItem('flexifit_user');
    localStorage.removeItem('flexifit_current_plan');
    localStorage.removeItem('flexifit_workout_plans');
    localStorage.removeItem('flexifit_completed_exercises');
    localStorage.removeItem('flexifit_feedback_history');
    setUserState(null);
    setCurrentPlan(null);
    setWorkoutPlans([]);
    setCompletedExercises([]);
    setFeedbackHistory([]);
    setIsAuthenticated(false);
    toast.info('Logged out');
  };

  const value = {
    user,
    currentPlan,
    workoutPlans,
    completedExercises,
    feedbackHistory,
    setUser,
    updateUser,
    savePlan,
    deletePlan,
    isAuthenticated,
    login,
    logout,
    toggleExerciseCompletion,
    submitExerciseFeedback,
    updateHealthStatus,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};