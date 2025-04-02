
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface BodyAreaSelectorProps {
  selectedAreas: string[];
  onChange: (areas: string[]) => void;
}

const bodyAreas = [
  { id: 'chest', label: 'Chest' },
  { id: 'back', label: 'Back' },
  { id: 'shoulders', label: 'Shoulders' },
  { id: 'arms', label: 'Arms' },
  { id: 'legs', label: 'Legs' },
  { id: 'core', label: 'Core' },
  { id: 'cardio', label: 'Cardio' },
];

export function BodyAreaSelector({ selectedAreas, onChange }: BodyAreaSelectorProps) {
  const handleCheckboxChange = (area: string) => {
    if (selectedAreas.includes(area)) {
      onChange(selectedAreas.filter((a) => a !== area));
    } else {
      onChange([...selectedAreas, area]);
    }
  };

  return (
    <div className="p-4 bg-secondary rounded-lg">
      <h3 className="text-lg font-medium mb-3">Select Target Body Areas</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {bodyAreas.map((area) => (
          <div key={area.id} className="flex items-center space-x-2">
            <Checkbox
              id={`area-${area.id}`}
              checked={selectedAreas.includes(area.id)}
              onCheckedChange={() => handleCheckboxChange(area.id)}
            />
            <Label htmlFor={`area-${area.id}`} className="cursor-pointer">
              {area.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}
