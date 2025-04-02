
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface CompletionRateProps {
  completionRate: number;
}

export function CompletionRate({ completionRate }: CompletionRateProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Completion Rate</CardTitle>
        <CardDescription>How often you complete your scheduled workouts</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center h-[300px]">
        <div className="relative w-40 h-40">
          {/* Circle background */}
          <div className="absolute inset-0 rounded-full bg-secondary"></div>
          
          {/* Progress circle - using conic gradient for progress */}
          <div 
            className="absolute inset-0 rounded-full"
            style={{ 
              background: `conic-gradient(hsl(var(--primary)) ${completionRate}%, transparent 0)` 
            }}
          ></div>
          
          {/* Inner circle with text */}
          <div className="absolute inset-2 rounded-full bg-background flex items-center justify-center">
            <div className="text-center">
              <span className="text-3xl font-bold">{completionRate}%</span>
              <p className="text-xs text-muted-foreground">Completion</p>
            </div>
          </div>
        </div>
        
        <p className="mt-6 text-sm text-center text-muted-foreground">
          You've completed {completionRate}% of your scheduled workouts this month.
        </p>
      </CardContent>
    </Card>
  );
}
