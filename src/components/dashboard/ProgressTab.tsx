
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function ProgressTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Workout Progress</CardTitle>
        <CardDescription>Your exercise completion over time</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Your progress metrics will appear here as you complete more workouts.</p>
      </CardContent>
    </Card>
  );
}
