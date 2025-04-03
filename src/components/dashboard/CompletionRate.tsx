
import React from 'react';

interface CompletionRateProps {
  completionRate: number;
  className?: string; // Added className prop
}

export function CompletionRate({ completionRate, className = "" }: CompletionRateProps) {
  return (
    <div className={`relative ${className}`}>
      {/* Circle background */}
      <div className="absolute inset-0 rounded-full bg-secondary"></div>
      
      {/* Progress circle - using conic gradient for progress */}
      <div 
        className="absolute inset-0 rounded-full"
        style={{ 
          background: `conic-gradient(hsl(var(--primary)) ${completionRate}%, transparent 0)` 
        }}
      ></div>
      
      {/* Inner circle with text */}
      <div className="absolute inset-2 rounded-full bg-background flex items-center justify-center">
        <div className="text-center">
          <span className="text-3xl font-bold">{completionRate}%</span>
          <p className="text-xs text-muted-foreground">Completion</p>
        </div>
      </div>
    </div>
  );
}
