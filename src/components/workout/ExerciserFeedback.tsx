import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface ExerciseFeedbackProps {
  exerciseId: string;
  exerciseName: string;
  onSubmitFeedback: (feedback: {
    exerciseId: string;
    difficulty: number;
    fatigue: number;
    enjoyment: number;
    completionTime: number;
    notes?: string;
  }) => void;
}

export function ExerciseFeedback({ exerciseId, exerciseName, onSubmitFeedback }: ExerciseFeedbackProps) {
  const [difficulty, setDifficulty] = useState(3);
  const [fatigue, setFatigue] = useState(3);
  const [enjoyment, setEnjoyment] = useState(3);
  const [completionTime, setCompletionTime] = useState(0);
  const [notes, setNotes] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSubmitFeedback({
      exerciseId,
      difficulty, 
      fatigue,
      enjoyment,
      completionTime: completionTime || 60, // Default 1 minute
      notes
    });
    
    toast.success('Feedback submitted, thank you for your input!');
    
    // Reset form
    setDifficulty(3);
    setFatigue(3);
    setEnjoyment(3);
    setCompletionTime(0);
    setNotes('');
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Exercise Feedback: {exerciseName}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty ({difficulty}/5)</Label>
            <Slider 
              id="difficulty" 
              min={1} 
              max={5} 
              step={0.5} 
              value={[difficulty]} 
              onValueChange={(value) => setDifficulty(value[0])} 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="fatigue">Fatigue Level ({fatigue}/5)</Label>
            <Slider 
              id="fatigue" 
              min={1} 
              max={5} 
              step={0.5} 
              value={[fatigue]} 
              onValueChange={(value) => setFatigue(value[0])} 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="enjoyment">Enjoyment ({enjoyment}/5)</Label>
            <Slider 
              id="enjoyment" 
              min={1} 
              max={5} 
              step={0.5} 
              value={[enjoyment]} 
              onValueChange={(value) => setEnjoyment(value[0])} 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="completionTime">Completion Time (seconds)</Label>
            <input 
              id="completionTime"
              type="number" 
              value={completionTime}
              onChange={(e) => setCompletionTime(Number(e.target.value))}
              className="w-full p-2 border rounded"
              min="0"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea 
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Do you have any specific feelings or suggestions about this exercise?"
            />
          </div>
          
          <Button type="submit" className="w-full">Submit Feedback</Button>
        </form>
      </CardContent>
    </Card>
  );
}