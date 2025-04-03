
import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface WeeklyWorkout {
  name: string;
  workouts: number;
}

interface ProgressChartProps {
  weeklyWorkouts: WeeklyWorkout[];
}

export function ProgressChart({ weeklyWorkouts }: ProgressChartProps) {
  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={weeklyWorkouts}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} domain={[0, 2]} />
          <Tooltip 
            formatter={(value) => [`${value} workout${value !== 1 ? 's' : ''}`, 'Completed']}
          />
          <Bar dataKey="workouts" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}
