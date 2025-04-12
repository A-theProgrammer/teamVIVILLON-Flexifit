import React, { useState, useEffect } from 'react';
import './WorkoutTabs.css';

interface WorkoutTabsProps {
  children: React.ReactNode[];
  tabTitles: string[];
  initialTabIndex?: number;
}

const WorkoutTabs: React.FC<WorkoutTabsProps> = ({ 
  children, 
  tabTitles, 
  initialTabIndex = 0 
}) => {
  const [activeTabIndex, setActiveTabIndex] = useState(initialTabIndex);
  
  // Update active tab when initialTabIndex changes
  useEffect(() => {
    setActiveTabIndex(initialTabIndex);
  }, [initialTabIndex]);
  
  // Ensure we have the correct number of children
  const childrenArray = React.Children.toArray(children);
  if (childrenArray.length !== tabTitles.length) {
    console.warn(`WorkoutTabs: Number of children (${childrenArray.length}) does not match number of tab titles (${tabTitles.length})`);
  }
  
  return (
    <div className="workout-tabs">
      <div className="tabs-header">
        {tabTitles.map((title, index) => (
          <button
            key={index}
            className={`tab-button ${activeTabIndex === index ? 'active' : ''}`}
            onClick={() => setActiveTabIndex(index)}
          >
            {title}
          </button>
        ))}
      </div>
      
      <div className="tab-content">
        {childrenArray[activeTabIndex]}
      </div>
    </div>
  );
};

export default WorkoutTabs;