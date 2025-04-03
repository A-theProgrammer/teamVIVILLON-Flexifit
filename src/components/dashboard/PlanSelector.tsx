
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { WorkoutPlan } from '@/types/user';
import { useNavigate } from 'react-router-dom';

interface PlanSelectorProps {
  workoutPlans: WorkoutPlan[];
  currentPlan: WorkoutPlan | null;
  selectedPlanId: string | null;
  setSelectedPlanId: (id: string) => void;
}

export function PlanSelector({
  workoutPlans,
  currentPlan,
  selectedPlanId,
  setSelectedPlanId
}: PlanSelectorProps) {
  const navigate = useNavigate();

  return (
    <div className="flex gap-2">
      {!currentPlan && (
        <Button onClick={() => navigate('/chatbot')}>
          Create Workout Plan
        </Button>
      )}
      {workoutPlans.length > 0 && (
        <Select value={selectedPlanId || ''} onValueChange={(value) => setSelectedPlanId(value)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select a plan" />
          </SelectTrigger>
          <SelectContent>
            {workoutPlans.map(plan => (
              <SelectItem key={plan.id} value={plan.id}>
                {plan.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
