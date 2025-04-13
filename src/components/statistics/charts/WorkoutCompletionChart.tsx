import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { UserFeedback } from '../../../adaptiveEngine/types';

interface WorkoutCompletionChartProps {
  feedbackHistory: UserFeedback[];
  timeRange: '7d' | '30d' | '90d' | 'all';
}

type GroupedData = {
  date: string;
  originalDate: string; 
  completedExercises: number;
  plannedExercises: number;
  completionRate: number;
};

const WorkoutCompletionChart: React.FC<WorkoutCompletionChartProps> = ({ 
  feedbackHistory,
  timeRange
}) => {
  // Group feedback data by date
  const chartData = useMemo(() => {
    // Exit early if no feedback
    if (feedbackHistory.length === 0) {
      return [];
    }

    // Group feedback by date
    const groupedByDate = feedbackHistory.reduce<Record<string, UserFeedback[]>>((acc, feedback) => {
      const date = new Date(feedback.completionTime);
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      
      acc[dateKey].push(feedback);
      return acc;
    }, {});

    // Create chart data points from grouped feedback
    const dataPoints: GroupedData[] = Object.entries(groupedByDate).map(([dateKey, feedbacks]) => {
      // Calculate metrics
      const completedExercises = feedbacks.length;
      
      // For demo purposes, we'll assume each day should have 5 exercises
      // In a real app, this would come from the workout plan
      const plannedExercises = 5;
      const completionRate = Math.min(100, (completedExercises / plannedExercises) * 100);
      
      // Format date label based on time range
      let displayDate = dateKey;
      if (timeRange === '7d' || timeRange === '30d') {
        // Show day and month for shorter ranges
        const dateParts = dateKey.split('-');
        displayDate = `${dateParts[1]}/${dateParts[2]}`;
      } else {
        // Show abbreviated month and day for longer ranges
        const date = new Date(dateKey);
        const month = date.toLocaleString('default', { month: 'short' });
        displayDate = `${month} ${date.getDate()}`;
      }
      
      return {
        date: displayDate,
        originalDate: dateKey, // Keep original for sorting
        completedExercises,
        plannedExercises,
        completionRate
      };
    });

    // Sort by date
    dataPoints.sort((a, b) => a.originalDate.localeCompare(b.originalDate));
    
    // For 7d and 30d, we want to show all days including those with no workouts
    if (timeRange === '7d' || timeRange === '30d') {
      const filledData: GroupedData[] = [];
      const now = new Date();
      const daysToShow = timeRange === '7d' ? 7 : 30;
      
      for (let i = daysToShow - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        
        const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        const displayDate = `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
        
        const existingData = dataPoints.find(d => d.originalDate === dateKey);
        
        if (existingData) {
          filledData.push({
            ...existingData,
            date: displayDate
          });
        } else {
          filledData.push({
            date: displayDate,
            originalDate: dateKey,
            completedExercises: 0,
            plannedExercises: 5,
            completionRate: 0
          });
        }
      }
      
      return filledData;
    }
    
    // For longer ranges, just return the grouped data
    return dataPoints.map(({ originalDate, ...rest }) => rest);
  }, [feedbackHistory, timeRange]);

  // If no data, show a message
  if (chartData.length === 0) {
    return (
      <div className="empty-chart-message">
        <p>No workout data available for the selected time period.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12 }}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis 
          yAxisId="left"
          orientation="left"
          tick={{ fontSize: 12 }}
          label={{ value: 'Exercises', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' }, dy: 50 }}
        />
        <YAxis 
          yAxisId="right"
          orientation="right"
          domain={[0, 100]}
          tick={{ fontSize: 12 }}
          label={{ value: 'Completion %', angle: 90, position: 'insideRight', style: { textAnchor: 'middle' }, dy: 40 }}
        />
        <Tooltip 
          formatter={(value, name) => {
            if (name === 'completionRate') return [`${value}%`, 'Completion Rate'];
            if (name === 'completedExercises') return [value, 'Completed Exercises'];
            if (name === 'plannedExercises') return [value, 'Planned Exercises'];
            return [value, name];
          }}
        />
        <Legend verticalAlign="top" height={36} />
        <Bar 
          yAxisId="left"
          dataKey="plannedExercises" 
          name="Planned" 
          fill="#e0e0e0" 
        />
        <Bar 
          yAxisId="left"
          dataKey="completedExercises" 
          name="Completed" 
          fill="#3498db" 
        />
        <Bar 
          yAxisId="right"
          dataKey="completionRate" 
          name="Completion Rate" 
          fill="#2ecc71" 
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default WorkoutCompletionChart;