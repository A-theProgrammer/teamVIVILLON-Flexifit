
import React from 'react';
import { WorkoutPlan } from '@/types/user';
import { WorkoutPlanDisplay } from '@/components/workout/WorkoutPlanDisplay';
import { PlanStats } from './PlanStats';
import { NoActivePlan } from './NoActivePlan';

interface WorkoutsTabProps {
  workoutPlans: WorkoutPlan[];
}

export function WorkoutsTab({ workoutPlans }: WorkoutsTabProps) {
  if (workoutPlans.length === 0) {
    return <NoActivePlan />;
  }
  
  return (
    <div className="space-y-8">
      {workoutPlans.map(plan => (
        <div key={plan.id} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <WorkoutPlanDisplay plan={plan} />
          </div>
          <PlanStats plan={plan} />
        </div>
      ))}
    </div>
  );
}
