import React from 'react';
import { UserModel } from '../../types/user';
import './UserProfileCard.css';

interface UserProfileCardProps {
  user: UserModel;
  onEditClick?: () => void;
}

const UserProfileCard: React.FC<UserProfileCardProps> = ({ user, onEditClick }) => {
  const { basicInformation, fitnessGoals, exerciseBackground } = user.staticAttributes;
  
  // Format goal for display
  const formatGoal = (goal: string): string => {
    return goal.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };
  
  // Format experience level for display
  const formatExperience = (level: string): string => {
    return level.charAt(0).toUpperCase() + level.slice(1);
  };

  // Format health condition for display
  const formatHealthCondition = (condition: string): string => {
    return condition.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };
  
  return (
    <div className="user-profile-card">
      <div className="user-profile-header">
        <h2>User Profile</h2>
        <button className="edit-button" onClick={onEditClick}>
          Edit Profile
        </button>
      </div>
      
      <div className="user-profile-content">
        <div className="profile-section">
          <h3>Basic Information</h3>
          <div className="profile-item">
            <span className="profile-label">Name:</span>
            <span className="profile-value">{basicInformation.name || 'Not specified'}</span>
          </div>
          <div className="profile-item">
            <span className="profile-label">Age:</span>
            <span className="profile-value">{basicInformation.age}</span>
          </div>
          <div className="profile-item">
            <span className="profile-label">Gender:</span>
            <span className="profile-value">{basicInformation.gender}</span>
          </div>
          <div className="profile-item">
            <span className="profile-label">Height:</span>
            <span className="profile-value">{basicInformation.height} cm</span>
          </div>
          <div className="profile-item">
            <span className="profile-label">Weight:</span>
            <span className="profile-value">{basicInformation.weight} kg</span>
          </div>
          {basicInformation.location && (
            <div className="profile-item">
              <span className="profile-label">Location:</span>
              <span className="profile-value">{basicInformation.location}</span>
            </div>
          )}
          {basicInformation.email && (
            <div className="profile-item">
              <span className="profile-label">Email:</span>
              <span className="profile-value">{basicInformation.email}</span>
            </div>
          )}
        </div>
        
        <div className="profile-section">
          <h3>Fitness Goals</h3>
          <div className="profile-item">
            <span className="profile-label">Primary Goal:</span>
            <span className="profile-value">{formatGoal(fitnessGoals.primaryGoal)}</span>
          </div>
        </div>
        
        <div className="profile-section">
          <h3>Exercise Background</h3>
          <div className="profile-item">
            <span className="profile-label">Experience Level:</span>
            <span className="profile-value">{formatExperience(exerciseBackground.experienceLevel)}</span>
          </div>
          <div className="profile-item">
            <span className="profile-label">Workout Frequency:</span>
            <span className="profile-value">{exerciseBackground.currentExerciseHabits.frequencyPerWeek} times per week</span>
          </div>
          <div className="profile-item">
            <span className="profile-label">Session Duration:</span>
            <span className="profile-value">{exerciseBackground.currentExerciseHabits.sessionDuration} minutes</span>
          </div>
        </div>
        
        {/* Display health conditions if available */}
        {basicInformation.healthStatus && basicInformation.healthStatus.length > 0 && (
          <div className="profile-section">
            <h3>Health Status</h3>
            <div className="profile-item">
              <span className="profile-label">Conditions:</span>
              <span className="profile-value">
                {basicInformation.healthStatus.map(formatHealthCondition).join(', ')}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfileCard;