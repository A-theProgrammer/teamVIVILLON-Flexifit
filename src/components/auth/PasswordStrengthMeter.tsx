
import React from 'react';

interface PasswordStrengthMeterProps {
  strength: 'weak' | 'medium' | 'strong';
}

export function PasswordStrengthMeter({ strength }: PasswordStrengthMeterProps) {
  const getColor = () => {
    switch (strength) {
      case 'weak':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'strong':
        return 'bg-green-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getWidth = () => {
    switch (strength) {
      case 'weak':
        return 'w-1/3';
      case 'medium':
        return 'w-2/3';
      case 'strong':
        return 'w-full';
      default:
        return 'w-0';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-xs">Password strength:</span>
        <span className="text-xs font-medium capitalize">{strength}</span>
      </div>
      <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full ${getWidth()} ${getColor()} transition-all duration-300`} 
        />
      </div>
    </div>
  );
}
