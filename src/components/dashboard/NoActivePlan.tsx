
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dumbbell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function NoActivePlan() {
  const navigate = useNavigate();
  
  return (
    <Card className="p-6 text-center">
      <div className="py-8">
        <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold">No Active Workout Plan</h3>
        <p className="text-muted-foreground mt-2 mb-6">
          You don't have an active workout plan yet. Chat with our assistant to create one.
        </p>
        <Button onClick={() => navigate('/chatbot')}>
          Create Workout Plan
        </Button>
      </div>
    </Card>
  );
}
