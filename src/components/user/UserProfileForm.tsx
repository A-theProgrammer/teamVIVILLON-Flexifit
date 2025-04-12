import React, { useState } from 'react';
import { UserModel } from '../../types/user';
import './UserProfileForm.css';

interface UserProfileFormProps {
  user: UserModel;
  onSave: (updatedUser: UserModel) => void;
  onCancel: () => void;
}

const UserProfileForm: React.FC<UserProfileFormProps> = ({ user, onSave, onCancel }) => {
  // Create form state from user data
  const [formData, setFormData] = useState({
    name: user.staticAttributes.basicInformation.name || '',
    age: user.staticAttributes.basicInformation.age,
    gender: user.staticAttributes.basicInformation.gender,
    height: user.staticAttributes.basicInformation.height,
    weight: user.staticAttributes.basicInformation.weight,
    location: user.staticAttributes.basicInformation.location || '',
    email: user.staticAttributes.basicInformation.email || '',
    primaryGoal: user.staticAttributes.fitnessGoals.primaryGoal,
    experienceLevel: user.staticAttributes.exerciseBackground.experienceLevel,
    frequencyPerWeek: user.staticAttributes.exerciseBackground.currentExerciseHabits.frequencyPerWeek,
    sessionDuration: user.staticAttributes.exerciseBackground.currentExerciseHabits.sessionDuration,
    healthStatus: user.staticAttributes.basicInformation.healthStatus || [],
    targetWeight: '',
    targetBodyFat: '',
  });

  // State for multi-step form
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  // State for error messages
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error for this field when the user makes changes
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  // Handle checkbox changes for health status
  const handleHealthStatusChange = (condition: string) => {
    const updatedHealthStatus = [...formData.healthStatus];
    const index = updatedHealthStatus.indexOf(condition);
    
    if (index > -1) {
      updatedHealthStatus.splice(index, 1);
    } else {
      updatedHealthStatus.push(condition);
    }
    
    setFormData({
      ...formData,
      healthStatus: updatedHealthStatus,
    });
  };

  // Validate the current step
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (step === 1) {
      if (!formData.name) newErrors.name = 'Name is required';
      if (formData.age <= 0) newErrors.age = 'Please enter a valid age';
      if (formData.height <= 0) newErrors.height = 'Please enter a valid height';
      if (formData.weight <= 0) newErrors.weight = 'Please enter a valid weight';
      if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    } else if (step === 2) {
      if (!formData.primaryGoal) newErrors.primaryGoal = 'Please select a primary goal';
      if (!formData.experienceLevel) newErrors.experienceLevel = 'Please select your experience level';
      if (formData.frequencyPerWeek <= 0) {
        newErrors.frequencyPerWeek = 'Please enter a valid frequency';
      }
      if (formData.sessionDuration <= 0) {
        newErrors.sessionDuration = 'Please enter a valid session duration';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigate to the next step
  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Navigate to the previous step
  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateStep(currentStep)) {
      // Create updated user object
      const updatedUser: UserModel = {
        ...user,
        staticAttributes: {
          ...user.staticAttributes,
          basicInformation: {
            ...user.staticAttributes.basicInformation,
            name: formData.name,
            age: Number(formData.age),
            gender: formData.gender as "male" | "female" | "other",
            height: Number(formData.height),
            weight: Number(formData.weight),
            location: formData.location,
            email: formData.email,
            healthStatus: formData.healthStatus,
          },
          fitnessGoals: {
            primaryGoal: formData.primaryGoal as "fat_loss" | "muscle_gain" | "endurance" | "general_health",
          },
          exerciseBackground: {
            experienceLevel: formData.experienceLevel as "beginner" | "intermediate" | "advanced",
            currentExerciseHabits: {
              frequencyPerWeek: Number(formData.frequencyPerWeek),
              sessionDuration: Number(formData.sessionDuration),
            },
          },
        },
      };
      
      // Save the updated user
      onSave(updatedUser);
    }
  };

  // Render the current step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="form-step">
            <h3>Basic Information</h3>
            <p className="form-step-description">
              Tell us about yourself so we can personalize your workout experience.
            </p>
            
            <div className="form-group">
              <label htmlFor="name">Name*</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <div className="error-message">{errors.name}</div>}
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="age">Age*</label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  min="1"
                  max="120"
                  className={errors.age ? 'error' : ''}
                />
                {errors.age && <div className="error-message">{errors.age}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="gender">Gender*</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="height">Height (cm)*</label>
                <input
                  type="number"
                  id="height"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  min="50"
                  max="250"
                  className={errors.height ? 'error' : ''}
                />
                {errors.height && <div className="error-message">{errors.height}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="weight">Weight (kg)*</label>
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  min="20"
                  max="300"
                  className={errors.weight ? 'error' : ''}
                />
                {errors.weight && <div className="error-message">{errors.weight}</div>}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="location">Location (Optional)</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email (Optional)</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && <div className="error-message">{errors.email}</div>}
              </div>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="form-step">
            <h3>Fitness Goals & Experience</h3>
            <p className="form-step-description">
              Let us know about your fitness goals and background to create a suitable workout plan.
            </p>
            
            <div className="form-group">
              <label htmlFor="primaryGoal">Primary Fitness Goal*</label>
              <select
                id="primaryGoal"
                name="primaryGoal"
                value={formData.primaryGoal}
                onChange={handleChange}
                className={errors.primaryGoal ? 'error' : ''}
              >
                <option value="">Select a goal</option>
                <option value="general_health">General Health & Fitness</option>
                <option value="fat_loss">Fat Loss</option>
                <option value="muscle_gain">Muscle Gain</option>
                <option value="endurance">Endurance</option>
              </select>
              {errors.primaryGoal && <div className="error-message">{errors.primaryGoal}</div>}
              
              <div className="goal-description">
                {formData.primaryGoal === 'general_health' && (
                  <span>Balance your overall fitness with a mix of strength, cardio, and flexibility.</span>
                )}
                {formData.primaryGoal === 'fat_loss' && (
                  <span>Focus on calorie burn with high-intensity training and cardio.</span>
                )}
                {formData.primaryGoal === 'muscle_gain' && (
                  <span>Build muscle through progressive overload and strength training.</span>
                )}
                {formData.primaryGoal === 'endurance' && (
                  <span>Improve your stamina and cardiovascular fitness.</span>
                )}
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="experienceLevel">Experience Level*</label>
              <select
                id="experienceLevel"
                name="experienceLevel"
                value={formData.experienceLevel}
                onChange={handleChange}
                className={errors.experienceLevel ? 'error' : ''}
              >
                <option value="">Select your level</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              {errors.experienceLevel && <div className="error-message">{errors.experienceLevel}</div>}
              
              <div className="experience-description">
                {formData.experienceLevel === 'beginner' && (
                  <span>New to working out or returning after a long break.</span>
                )}
                {formData.experienceLevel === 'intermediate' && (
                  <span>Consistent workout routine for several months.</span>
                )}
                {formData.experienceLevel === 'advanced' && (
                  <span>Experienced with proper form and challenging workouts.</span>
                )}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="frequencyPerWeek">Workouts Per Week*</label>
                <input
                  type="number"
                  id="frequencyPerWeek"
                  name="frequencyPerWeek"
                  value={formData.frequencyPerWeek}
                  onChange={handleChange}
                  min="1"
                  max="7"
                  className={errors.frequencyPerWeek ? 'error' : ''}
                />
                {errors.frequencyPerWeek && <div className="error-message">{errors.frequencyPerWeek}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="sessionDuration">Session Duration (min)*</label>
                <input
                  type="number"
                  id="sessionDuration"
                  name="sessionDuration"
                  value={formData.sessionDuration}
                  onChange={handleChange}
                  min="10"
                  max="180"
                  className={errors.sessionDuration ? 'error' : ''}
                />
                {errors.sessionDuration && <div className="error-message">{errors.sessionDuration}</div>}
              </div>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="form-step">
            <h3>Health & Goals</h3>
            <p className="form-step-description">
              Share any health conditions we should be aware of and your target metrics.
            </p>
            
            <div className="form-group">
              <label>Health Conditions (Select all that apply)</label>
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.healthStatus.includes('joint_pain')}
                    onChange={() => handleHealthStatusChange('joint_pain')}
                  />
                  Joint Pain
                </label>
                
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.healthStatus.includes('back_pain')}
                    onChange={() => handleHealthStatusChange('back_pain')}
                  />
                  Back Pain
                </label>
                
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.healthStatus.includes('recovering_injury')}
                    onChange={() => handleHealthStatusChange('recovering_injury')}
                  />
                  Recovering from Injury
                </label>
                
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.healthStatus.includes('cardiovascular_issue')}
                    onChange={() => handleHealthStatusChange('cardiovascular_issue')}
                  />
                  Cardiovascular Issues
                </label>
                
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.healthStatus.includes('high_blood_pressure')}
                    onChange={() => handleHealthStatusChange('high_blood_pressure')}
                  />
                  High Blood Pressure
                </label>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="targetWeight">Target Weight (kg) (Optional)</label>
                <input
                  type="number"
                  id="targetWeight"
                  name="targetWeight"
                  value={formData.targetWeight}
                  onChange={handleChange}
                  min="20"
                  max="300"
                  placeholder="Your goal weight"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="targetBodyFat">Target Body Fat % (Optional)</label>
                <input
                  type="number"
                  id="targetBodyFat"
                  name="targetBodyFat"
                  value={formData.targetBodyFat}
                  onChange={handleChange}
                  min="5"
                  max="50"
                  placeholder="Your goal body fat %"
                />
              </div>
            </div>
            
            <div className="form-group">
              <p className="info-text">
                This information helps our adaptive engine create a workout plan that's safer and more effective for you.
              </p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="user-profile-form-container">
      <div className="user-profile-form">
        <div className="form-header">
          <h2>Edit Your Profile</h2>
          <button className="close-button" onClick={onCancel}>×</button>
        </div>
        
        <div className="progress-indicator">
          <div className="progress-steps">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div 
                key={index} 
                className={`progress-step ${currentStep >= index + 1 ? 'active' : ''}`}
              >
                <div className="step-number">{index + 1}</div>
                <div className="step-label">
                  {index === 0 ? 'Basic Info' : index === 1 ? 'Fitness Goals' : 'Health & Targets'}
                </div>
              </div>
            ))}
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
            ></div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          {renderCurrentStep()}
          
          <div className="form-navigation">
            {currentStep > 1 && (
              <button 
                type="button" 
                className="form-nav-button back-button"
                onClick={handlePrevStep}
              >
                Previous
              </button>
            )}
            
            {currentStep < totalSteps ? (
              <button 
                type="button" 
                className="form-nav-button next-button"
                onClick={handleNextStep}
              >
                Next
              </button>
            ) : (
              <button 
                type="submit" 
                className="form-nav-button submit-button"
              >
                Save Profile
              </button>
            )}
          </div>
        </form>
      </div>
      <div className="form-overlay" onClick={onCancel}></div>
    </div>
  );
};

export default UserProfileForm;