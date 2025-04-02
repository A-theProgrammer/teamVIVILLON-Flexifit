
import { WorkoutPlan } from '@/types/user';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Clock, Dumbbell, BarChart } from 'lucide-react';

interface WorkoutPlanDisplayProps {
  plan: WorkoutPlan;
  compact?: boolean;
}

export function WorkoutPlanDisplay({ plan, compact = false }: WorkoutPlanDisplayProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl gradient-text">{plan.name}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
          </div>
        </div>
        <div className="flex gap-2 mt-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Dumbbell className="h-3 w-3" /> 
            {plan.days.length} days
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> 
            ~45 min/day
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full" defaultValue="day-1">
          {plan.days.map((day) => (
            <AccordionItem key={day.dayNumber} value={`day-${day.dayNumber}`}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center">
                  <span className="font-medium">Day {day.dayNumber}</span>
                  <Badge variant="secondary" className="ml-2">
                    {day.focus}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 py-1">
                  {day.exercises.map((exercise, index) => (
                    <div key={index} className="bg-secondary/50 p-3 rounded-md">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">{exercise.name}</h4>
                        {exercise.intensity && (
                          <Badge 
                            variant={
                              exercise.intensity === 'High' ? 'destructive' : 
                              exercise.intensity === 'Medium' ? 'secondary' : 
                              'outline'
                            }
                            className="text-xs"
                          >
                            {exercise.intensity}
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                        {exercise.sets && (
                          <span>{exercise.sets} sets</span>
                        )}
                        {exercise.reps && (
                          <span>{exercise.reps} reps</span>
                        )}
                        {exercise.duration && (
                          <span>{exercise.duration} sec</span>
                        )}
                        {exercise.restTime && (
                          <span>{exercise.restTime}s rest</span>
                        )}
                      </div>
                      {exercise.notes && !compact && (
                        <p className="text-xs italic mt-2">{exercise.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
