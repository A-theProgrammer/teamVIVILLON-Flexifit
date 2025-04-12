import React from 'react';
import { AdjustmentResult } from '../../adaptiveEngine/types';
import './AdaptiveChangesDisplay.css';

interface AdaptiveChangesDisplayProps {
  changes: AdjustmentResult | null;
}

const AdaptiveChangesDisplay: React.FC<AdaptiveChangesDisplayProps> = ({ changes }) => {
  if (!changes) {
    return (
      <div className="adaptive-changes-display empty">
        <h2>Adaptive Changes</h2>
        <p className="no-changes-message">
          No adaptive changes have been made yet. Generate a new plan or adapt your current plan to see changes.
        </p>
      </div>
    );
  }

  return (
    <div className="adaptive-changes-display">
      <h2>Adaptive Changes</h2>
      
      <div className="changes-message">
        <p>{changes.message}</p>
      </div>
      
      <div className="changes-sections">
        {/* Parameter Changes */}
        <div className="changes-section">
          <h3>Parameter Adjustments</h3>
          <div className="parameters-list">
            <div className="parameter-item">
              <span className="parameter-label">Intensity:</span>
              <span className="parameter-value">{(changes.parameters.intensity * 100).toFixed(0)}%</span>
            </div>
            <div className="parameter-item">
              <span className="parameter-label">Volume:</span>
              <span className="parameter-value">{(changes.parameters.volume * 100).toFixed(0)}%</span>
            </div>
            <div className="parameter-item">
              <span className="parameter-label">Frequency:</span>
              <span className="parameter-value">{changes.parameters.frequency} days/week</span>
            </div>
            <div className="parameter-item">
              <span className="parameter-label">Rest Period:</span>
              <span className="parameter-value">{changes.parameters.restPeriod} sec</span>
            </div>
            <div className="parameter-item">
              <span className="parameter-label">Progression:</span>
              <span className="parameter-value">{(changes.parameters.progression * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>
        
        {/* Exercise Changes */}
        {changes.exerciseChanges.length > 0 && (
          <div className="changes-section">
            <h3>Exercise Changes</h3>
            <ul className="changes-list">
              {changes.exerciseChanges.map((change, index) => (
                <li key={index} className="change-item">
                  <div className="change-header">
                    <span className="change-type">
                      {change.adjustmentType === 'replace' ? 'Replaced Exercise' : 'Modified Exercise'}
                    </span>
                    <span className="change-id">{change.exerciseId}</span>
                  </div>
                  <div className="change-details">
                    {change.adjustmentType === 'replace' && change.newExercise && (
                      <>
                        <div className="change-exercise">
                          <span className="old-value">Old: {change.oldExercise?.name || 'Unknown'}</span>
                          <span className="arrow">→</span>
                          <span className="new-value">New: {change.newExercise.name}</span>
                        </div>
                      </>
                    )}
                    
                    {change.adjustmentType === 'modify' && change.paramChanges && (
                      <div className="param-changes">
                        {change.paramChanges.sets && (
                          <div className="param-change">
                            <span className="param-name">Sets:</span>
                            <span className="old-value">{change.oldExercise?.sets || '?'}</span>
                            <span className="arrow">→</span>
                            <span className="new-value">{change.paramChanges.sets}</span>
                          </div>
                        )}
                        
                        {change.paramChanges.reps && (
                          <div className="param-change">
                            <span className="param-name">Reps:</span>
                            <span className="old-value">{change.oldExercise?.reps || '?'}</span>
                            <span className="arrow">→</span>
                            <span className="new-value">{change.paramChanges.reps}</span>
                          </div>
                        )}
                        
                        {change.paramChanges.duration && (
                          <div className="param-change">
                            <span className="param-name">Duration:</span>
                            <span className="old-value">{change.oldExercise?.duration || '?'}</span>
                            <span className="arrow">→</span>
                            <span className="new-value">{change.paramChanges.duration}s</span>
                          </div>
                        )}
                        
                        {change.paramChanges.restTime && (
                          <div className="param-change">
                            <span className="param-name">Rest:</span>
                            <span className="old-value">{change.oldExercise?.restTime || '?'}</span>
                            <span className="arrow">→</span>
                            <span className="new-value">{change.paramChanges.restTime}s</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="change-reason">
                      <span className="reason-label">Reason:</span>
                      <span className="reason-text">{change.reason}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Plan Structure Changes */}
        {changes.planStructureChanges.length > 0 && (
          <div className="changes-section">
            <h3>Plan Structure Changes</h3>
            <ul className="changes-list">
              {changes.planStructureChanges.map((change, index) => (
                <li key={index} className="change-item">
                  <div className="change-header">
                    <span className="change-type">
                      {change.type === 'addDay' && 'Added Training Day'}
                      {change.type === 'removeDay' && 'Removed Training Day'}
                      {change.type === 'reorderDay' && 'Reordered Training Days'}
                      {change.type === 'changeRest' && 'Modified Rest Schedule'}
                    </span>
                    {change.dayIndex !== undefined && (
                      <span className="change-id">Day {change.dayIndex + 1}</span>
                    )}
                  </div>
                  <div className="change-details">
                    <div className="change-reason">
                      <span className="reason-label">Reason:</span>
                      <span className="reason-text">{change.reason}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Adjustment Reasons */}
        {changes.adjustmentReasons && changes.adjustmentReasons.length > 0 && (
          <div className="changes-section">
            <h3>Adaptation Insights</h3>
            <ul className="reasons-list">
              {changes.adjustmentReasons.map((reason, index) => (
                <li key={index} className="reason-item">{reason}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdaptiveChangesDisplay;