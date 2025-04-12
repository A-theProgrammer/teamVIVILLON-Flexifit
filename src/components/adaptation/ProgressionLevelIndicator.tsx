import React from 'react';
import { ProgressionLevel } from '../../adaptiveEngine/types';
import './ProgressionLevelIndicator.css';

interface ProgressionLevelIndicatorProps {
  progressionLevel: ProgressionLevel | number;
}

const ProgressionLevelIndicator: React.FC<ProgressionLevelIndicatorProps> = ({ progressionLevel }) => {
  // Create a mapping of progression levels to display values
  const progressionLevels = [
    { level: ProgressionLevel.Deload, name: 'Deload', color: '#e74c3c', description: 'Recovery period to reduce fatigue and prepare for the next training phase' },
    { level: ProgressionLevel.Maintenance, name: 'Maintenance', color: '#f39c12', description: 'Maintaining current fitness level with consistent training' },
    { level: ProgressionLevel.VerySlowProgress, name: 'Very Slow Progress', color: '#f1c40f', description: 'Making minimal incremental improvements to build a foundation' },
    { level: ProgressionLevel.SlowProgress, name: 'Slow Progress', color: '#2ecc71', description: 'Steady progress with gradual increases in training difficulty' },
    { level: ProgressionLevel.NormalProgress, name: 'Normal Progress', color: '#2ecc71', description: 'Consistent improvements at a standard rate of progression' },
    { level: ProgressionLevel.ModerateProgress, name: 'Moderate Progress', color: '#27ae60', description: 'Accelerated progression with noticeable improvements' },
    { level: ProgressionLevel.FastProgress, name: 'Fast Progress', color: '#3498db', description: 'Rapid improvements indicating high training adaptability' },
    { level: ProgressionLevel.Breakthrough, name: 'Breakthrough', color: '#9b59b6', description: 'Exceptional progress with significant performance jumps' },
  ];
  
  // Find the current progression level
  const currentLevel = progressionLevels.find(level => level.level === progressionLevel);
  
  // If we can't find an exact match, find the closest
  const getClosestLevel = () => {
    let closest = progressionLevels[1]; // Default to maintenance
    let closestDiff = Math.abs(progressionLevel as number - progressionLevels[1].level as number);
    
    for (const level of progressionLevels) {
      const diff = Math.abs(progressionLevel as number - level.level as number);
      if (diff < closestDiff) {
        closestDiff = diff;
        closest = level;
      }
    }
    
    return closest;
  };
  
  const displayLevel = currentLevel || getClosestLevel();
  
  // Calculate position on the progression scale (0-100%)
  const getProgressionPosition = (): number => {
    // Deload is -1, Breakthrough is 1, so we need to map -1 to 1 to 0 to 100
    return ((progressionLevel as number + 1) / 2) * 100;
  };
  
  return (
    <div className="progression-level-indicator">
      <h3>Current Progression Level</h3>
      
      <div className="progression-display">
        <div className="progression-name" style={{ color: displayLevel.color }}>
          {displayLevel.name}
        </div>
        
        <div className="progression-bar-container">
          <div className="progression-bar">
            <div 
              className="progression-marker"
              style={{ 
                left: `${getProgressionPosition()}%`,
                backgroundColor: displayLevel.color
              }}
            ></div>
            
            {/* Level labels */}
            <div className="progression-labels">
              <span className="label-deload">Deload</span>
              <span className="label-maintenance">Maintenance</span>
              <span className="label-slow">Slow</span>
              <span className="label-normal">Normal</span>
              <span className="label-fast">Fast</span>
              <span className="label-breakthrough">Breakthrough</span>
            </div>
          </div>
        </div>
        
        <p className="progression-description">
          {displayLevel.description}
        </p>
      </div>
    </div>
  );
};

export default ProgressionLevelIndicator;