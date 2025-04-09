// src/components/adaptive/InjuryReportingModal.tsx
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface InjuryReportingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    affectedAreas: string[];
    description: string;
    severity: string;
    reportedDate: string;
  }) => void;
}

export function InjuryReportingModal({ isOpen, onClose, onSave }: InjuryReportingModalProps) {
  const [selectedBodyParts, setSelectedBodyParts] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('moderate');
  
  const bodyParts = [
    { id: 'knee', label: 'Knee' },
    { id: 'shoulder', label: 'Shoulder' },
    { id: 'back', label: 'Back/Spine' },
    { id: 'wrist', label: 'Wrist/Hand' },
    { id: 'ankle', label: 'Ankle/Foot' },
    { id: 'hip', label: 'Hip' },
    { id: 'neck', label: 'Neck' },
    { id: 'elbow', label: 'Elbow' }
  ];
  
  const handleSubmit = () => {
    onSave({
      affectedAreas: selectedBodyParts,
      description,
      severity,
      reportedDate: new Date().toISOString()
    });
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report Injury or Limitation</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Affected Body Parts</h3>
            <div className="grid grid-cols-2 gap-2">
              {bodyParts.map(part => (
                <div key={part.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`part-${part.id}`}
                    checked={selectedBodyParts.includes(part.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedBodyParts([...selectedBodyParts, part.id]);
                      } else {
                        setSelectedBodyParts(selectedBodyParts.filter(id => id !== part.id));
                      }
                    }}
                  />
                  <Label htmlFor={`part-${part.id}`}>{part.label}</Label>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <Label htmlFor="severity">Severity Level</Label>
            <select
              id="severity"
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="w-full p-2 border rounded mt-1"
            >
              <option value="mild">Mild - Minor discomfort</option>
              <option value="moderate">Moderate - Limited function</option>
              <option value="severe">Severe - Significantly limited</option>
            </select>
          </div>
          
          <div>
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe your injury or limitation..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Save Limitation</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}