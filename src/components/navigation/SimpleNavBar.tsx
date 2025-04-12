import React from 'react';
import './SimpleNavBar.css';

interface SimpleNavBarProps {
  title?: string;
}

const SimpleNavBar: React.FC<SimpleNavBarProps> = ({ title = 'Adaptive Workout App' }) => {
  return (
    <nav className="navbar">
      <div className="navbar-content">
        <h1 className="navbar-title">{title}</h1>
        <div className="navbar-links">
          <span className="navbar-link">Demo Project</span>
        </div>
      </div>
    </nav>
  );
};

export default SimpleNavBar;