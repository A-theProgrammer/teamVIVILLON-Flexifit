
import React from 'react';
import { Check, X } from 'lucide-react';

interface PasswordRequirementProps {
  text: string;
  fulfilled: boolean;
}

export function PasswordRequirement({ text, fulfilled }: PasswordRequirementProps) {
  return (
    <div className={`flex items-center space-x-2 text-sm ${fulfilled ? 'text-green-500 line-through' : 'text-red-500'}`}>
      {fulfilled ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
      <span>{text}</span>
    </div>
  );
}
