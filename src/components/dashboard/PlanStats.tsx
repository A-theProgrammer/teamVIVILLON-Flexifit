
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Dumbbell, BarChart, ArrowRight } from 'lucide-react';
import { WorkoutPlan } from '@/types/user';
import { useNavigate } from 'react-router-dom';

interface PlanStatsProps {
  plan: WorkoutPlan;
}

export function PlanStats({ plan }: PlanStatsProps) {
  const navigate = useNavigate();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Plan Stats</CardTitle>
        <CardDescription>Overview of this workout plan</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          <li className="flex items-center">
            <div className="bg-primary/20 p-2 rounded mr-3">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">{plan.days.length} workout days</p>
              <p className="text-sm text-muted-foreground">Per week</p>
            </div>
          </li>
          <li className="flex items-center">
            <div className="bg-primary/20 p-2 rounded mr-3">
              <Dumbbell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">{plan.days.reduce((acc, day) => acc + day.exercises.length, 0)} exercises</p>
              <p className="text-sm text-muted-foreground">Total in plan</p>
            </div>
          </li>
          {plan.targetBodyAreas && plan.targetBodyAreas.length > 0 && (
            <li className="flex items-center">
              <div className="bg-primary/20 p-2 rounded mr-3">
                <BarChart className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Target areas</p>
                <p className="text-sm text-muted-foreground">
                  {plan.targetBodyAreas.join(', ')}
                </p>
              </div>
            </li>
          )}
        </ul>
        
        <div className="mt-6">
          <Button variant="outline" className="w-full" onClick={() => navigate('/chatbot')}>
            Modify Plan <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
