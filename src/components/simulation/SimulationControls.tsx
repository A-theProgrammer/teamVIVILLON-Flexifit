import React, { useState, useEffect } from 'react';
import { UserModel } from '../../types/user';
import { UserFeedback } from '../../adaptiveEngine/types';
import { useAppContext } from '../../context/AppContext';
import './SimulationControls.css';

interface SimulationControlsProps {
  onGenerateUser: (user: UserModel) => void;
  onSimulateFeedback: (feedback: UserFeedback) => void;
  onSimulateTime: (days: number) => void;
}

const SimulationControls: React.FC<SimulationControlsProps> = ({
  onGenerateUser,
  onSimulateFeedback,
  onSimulateTime
}) => {
  const { currentDate, setCurrentDate } = useAppContext();
  const [selectedUserType, setSelectedUserType] = useState<string>('beginner');
  const [selectedGoal, setSelectedGoal] = useState<string>('general_health');
  const [simulationDays, setSimulationDays] = useState<number>(7);
  const [dateInput, setDateInput] = useState<string>('');

  // Initialize date input with current date
  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    setDateInput(`${year}-${month}-${day}`);
  }, [currentDate]);

  // Generate a demo user
  const generateDemoUser = () => {
    const now = new Date().toISOString();
    
    // Create a demo user based on selected type
    const demoUser: UserModel = {
      userId: `demo-${selectedUserType}-${Date.now()}`,
      staticAttributes: {
        basicInformation: {
          age: selectedUserType === 'beginner' ? 25 : selectedUserType === 'intermediate' ? 32 : 40,
          gender: 'male',
          height: 175,
          weight: 75,
          name: `Demo ${selectedUserType.charAt(0).toUpperCase() + selectedUserType.slice(1)} User`,
          location: 'Demo City',
          email: `demo-${selectedUserType}@example.com`,
          healthStatus: selectedUserType === 'advanced' ? ['previous_shoulder_injury'] : []
        },
        fitnessGoals: {
          primaryGoal: selectedGoal as "fat_loss" | "muscle_gain" | "endurance" | "general_health",
        },
        exerciseBackground: {
          experienceLevel: selectedUserType as "beginner" | "intermediate" | "advanced",
          currentExerciseHabits: {
            frequencyPerWeek: selectedUserType === 'beginner' ? 2 : 
                            selectedUserType === 'intermediate' ? 4 : 5,
            sessionDuration: selectedUserType === 'beginner' ? 45 : 
                            selectedUserType === 'intermediate' ? 60 : 75
          }
        }
      },
      dynamicAttributes: {
        trainingData: [],
        workoutProgress: {
          completedExercises: [],
          lastWorkout: now,
          streakDays: selectedUserType === 'beginner' ? 1 : 
                    selectedUserType === 'intermediate' ? 3 : 7
        },
        savedWorkoutPlans: []
      }
    };
    
    onGenerateUser(demoUser);
  };

  // Generate random workout feedback
  const generateRandomFeedback = () => {
    // Create a random exercise ID (1-7 for day, 0-3 for exercise index)
    const dayNumber = Math.floor(Math.random() * 7) + 1;
    const exerciseIndex = Math.floor(Math.random() * 4);
    const exerciseId = `${dayNumber}-${exerciseIndex}`;
    
    // Generate random ratings based on user type
    let difficultyBase = selectedUserType === 'beginner' ? 3.5 : 
                        selectedUserType === 'intermediate' ? 3 : 2.5;
    
    let fatigueBase = selectedUserType === 'beginner' ? 4 : 
                      selectedUserType === 'intermediate' ? 3.5 : 3;
    
    let enjoymentBase = selectedUserType === 'beginner' ? 3 : 
                        selectedUserType === 'intermediate' ? 3.5 : 4;
    
    // Add some randomness
    const randomVariance = () => (Math.random() * 2 - 1);
    
    const difficulty = Math.max(1, Math.min(5, difficultyBase + randomVariance()));
    const fatigue = Math.max(1, Math.min(5, fatigueBase + randomVariance()));
    const enjoyment = Math.max(1, Math.min(5, enjoymentBase + randomVariance()));
    
    const feedback: UserFeedback = {
      exerciseId,
      difficulty,
      fatigue,
      enjoyment,
      completionTime: Date.now(),
      notes: generateRandomNote(difficulty, enjoyment)
    };
    
    onSimulateFeedback(feedback);
  };

  // Generate a random feedback note
  const generateRandomNote = (difficulty: number, enjoyment: number) => {
    const difficultyNotes = [
      "Found this quite manageable",
      "This was a good challenge for me",
      "Struggled to complete all reps",
      "This exercise was very challenging",
      "Had to take extra breaks to complete"
    ];
    
    const enjoymentNotes = [
      "Didn't enjoy this exercise much",
      "It was okay but not my favorite",
      "A decent part of the workout",
      "Enjoyed this exercise a lot",
      "One of my favorite exercises!"
    ];
    
    // Select notes based on ratings
    const difficultyIndex = Math.min(4, Math.floor(difficulty) - 1);
    const enjoymentIndex = Math.min(4, Math.floor(enjoyment) - 1);
    
    // 50/50 chance of mentioning difficulty or enjoyment
    return Math.random() > 0.5 ? difficultyNotes[difficultyIndex] : enjoymentNotes[enjoymentIndex];
  };

  // Handle date change
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateInput(e.target.value);
  };

  // Set current date
  const setSimulatedDate = () => {
    if (dateInput) {
      const newDate = new Date(dateInput);
      if (!isNaN(newDate.getTime())) {
        setCurrentDate(newDate);
      }
    }
  };

  return (
    <div className="simulation-controls">
      <h2>Simulation Controls</h2>
      <p className="simulation-description">
        For demonstration purposes only. These controls simulate user behavior to demonstrate the adaptive engine.
      </p>
      
      <div className="simulation-sections">
        <div className="simulation-section">
          <h3>Generate Demo User</h3>
          <div className="control-group">
            <label>User Type:</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="userType"
                  value="beginner"
                  checked={selectedUserType === 'beginner'}
                  onChange={() => setSelectedUserType('beginner')}
                />
                Beginner
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="userType"
                  value="intermediate"
                  checked={selectedUserType === 'intermediate'}
                  onChange={() => setSelectedUserType('intermediate')}
                />
                Intermediate
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="userType"
                  value="advanced"
                  checked={selectedUserType === 'advanced'}
                  onChange={() => setSelectedUserType('advanced')}
                />
                Advanced
              </label>
            </div>
          </div>
          
          <div className="control-group">
            <label>Fitness Goal:</label>
            <select
              value={selectedGoal}
              onChange={(e) => setSelectedGoal(e.target.value)}
              className="simulation-select"
            >
              <option value="general_health">General Health</option>
              <option value="fat_loss">Fat Loss</option>
              <option value="muscle_gain">Muscle Gain</option>
              <option value="endurance">Endurance</option>
            </select>
          </div>
          
          <button
            className="simulation-button user-button"
            onClick={generateDemoUser}
          >
            Generate Demo User
          </button>
        </div>
        
        <div className="simulation-section">
          <h3>Simulate Feedback</h3>
          <p className="simulation-note">
            Generates random workout feedback to test adaptation.
          </p>
          <button
            className="simulation-button feedback-button"
            onClick={generateRandomFeedback}
          >
            Generate Random Feedback
          </button>
        </div>
        
        <div className="simulation-section">
          <h3>Simulate Date & Time</h3>
          <div className="control-group">
            <label>Set Current Date:</label>
            <input
              type="date"
              value={dateInput}
              onChange={handleDateChange}
              className="date-input"
            />
            <button
              className="simulation-button date-button"
              onClick={setSimulatedDate}
            >
              Set Date
            </button>
          </div>
          
          <div className="control-group">
            <label>Days to Advance:</label>
            <input
              type="number"
              min="1"
              max="30"
              value={simulationDays}
              onChange={(e) => setSimulationDays(parseInt(e.target.value) || 7)}
              className="days-input"
            />
          </div>
          <button
            className="simulation-button time-button"
            onClick={() => onSimulateTime(simulationDays)}
          >
            Simulate {simulationDays} Days
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimulationControls;