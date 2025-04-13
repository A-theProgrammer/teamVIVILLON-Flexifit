import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { WorkoutPlan } from '../../../types/user';
import { UserFeedback } from '../../../adaptiveEngine/types';

interface BodyPartDistributionChartProps {
  workoutPlan: WorkoutPlan;
  feedbackHistory: UserFeedback[];
}

interface BodyPartData {
  name: string;
  value: number;
  color: string;
}

const BodyPartDistributionChart: React.FC<BodyPartDistributionChartProps> = ({ 
  workoutPlan, 
  feedbackHistory 
}) => {
  // Map exercises to body parts
  const exerciseToBodyPartMap: Record<string, string[]> = {
    'Push-Ups': ['Chest', 'Shoulders', 'Arms'],
    'Bench Press': ['Chest', 'Shoulders', 'Arms'],
    'Incline Press': ['Chest', 'Shoulders'],
    'Dips': ['Chest', 'Arms'],
    'Chest Fly': ['Chest'],
    'Pull-Ups': ['Back', 'Arms'],
    'Chin-Ups': ['Back', 'Arms'],
    'Rows': ['Back'],
    'Lat Pulldown': ['Back'],
    'Deadlift': ['Back', 'Legs'],
    'Squats': ['Legs', 'Core'],
    'Lunges': ['Legs'],
    'Leg Press': ['Legs'],
    'Leg Extensions': ['Legs'],
    'Leg Curls': ['Legs'],
    'Calf Raises': ['Legs'],
    'Shoulder Press': ['Shoulders'],
    'Lateral Raises': ['Shoulders'],
    'Front Raises': ['Shoulders'],
    'Bicep Curls': ['Arms'],
    'Tricep Extensions': ['Arms'],
    'Skull Crushers': ['Arms'],
    'Hammer Curls': ['Arms'],
    'Plank': ['Core'],
    'Crunches': ['Core'],
    'Leg Raises': ['Core'],
    'Russian Twists': ['Core'],
    'Running': ['Cardio'],
    'Cycling': ['Cardio'],
    'Jumping Jacks': ['Cardio'],
    'Burpees': ['Cardio', 'Core'],
    'HIIT': ['Cardio'],
    'Yoga': ['Flexibility'],
    'Stretching': ['Flexibility']
  };

  // Body part colors
  const bodyPartColors: Record<string, string> = {
    'Chest': '#3498db',
    'Back': '#2ecc71',
    'Legs': '#e74c3c',
    'Shoulders': '#f39c12',
    'Arms': '#9b59b6',
    'Core': '#1abc9c',
    'Cardio': '#e67e22',
    'Flexibility': '#34495e'
  };

  // Calculate body part distribution
  const bodyPartData = useMemo(() => {
    // Track body part frequency
    const bodyPartFrequency: Record<string, number> = {};
    
    // Process all exercises from feedback history
    feedbackHistory.forEach(feedback => {
      const [dayNumber, exerciseIndex] = feedback.exerciseId.split('-').map(Number);
      
      // Find the corresponding day and exercise
      const day = workoutPlan.days.find(d => d.dayNumber === dayNumber);
      if (day && day.exercises[exerciseIndex]) {
        const exerciseName = day.exercises[exerciseIndex].name;
        
        // Map exercise to body parts
        const bodyParts = exerciseToBodyPartMap[exerciseName] || [];
        
        // Increment count for each body part
        bodyParts.forEach(part => {
          bodyPartFrequency[part] = (bodyPartFrequency[part] || 0) + 1;
        });
      }
    });
    
    // If no feedback, analyze the plan structure
    if (Object.keys(bodyPartFrequency).length === 0) {
      workoutPlan.days.forEach(day => {
        day.exercises.forEach(exercise => {
          const bodyParts = exerciseToBodyPartMap[exercise.name] || [];
          
          bodyParts.forEach(part => {
            bodyPartFrequency[part] = (bodyPartFrequency[part] || 0) + 1;
          });
        });
      });
    }
    
    // Convert to chart data format
    const data: BodyPartData[] = Object.entries(bodyPartFrequency)
      .map(([name, value]) => ({
        name,
        value,
        color: bodyPartColors[name] || '#cccccc'
      }))
      .sort((a, b) => b.value - a.value); // Sort by frequency
    
    return data;
  }, [workoutPlan, feedbackHistory]);

  // Calculate alternate chart data for radar chart option
  const alternateData = useMemo(() => {
    // Group data by main body region
    const mainRegions: Record<string, { name: string, value: number, color: string }> = {
      'Upper Body': { name: 'Upper Body', value: 0, color: '#3498db' },
      'Lower Body': { name: 'Lower Body', value: 0, color: '#e74c3c' },
      'Core': { name: 'Core', value: 0, color: '#1abc9c' },
      'Cardio': { name: 'Cardio', value: 0, color: '#e67e22' }
    };
    
    // Map body parts to main regions
    const regionMapping: Record<string, string> = {
      'Chest': 'Upper Body',
      'Back': 'Upper Body',
      'Shoulders': 'Upper Body',
      'Arms': 'Upper Body',
      'Legs': 'Lower Body',
      'Core': 'Core',
      'Cardio': 'Cardio',
      'Flexibility': 'Core'
    };
    
    // Aggregate by region
    bodyPartData.forEach(part => {
      const region = regionMapping[part.name] || 'Other';
      if (mainRegions[region]) {
        mainRegions[region].value += part.value;
      }
    });
    
    return Object.values(mainRegions);
  }, [bodyPartData]);

  // Chart setup
  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    if (percent < 0.05) return null; // Don't show label for small slices
    
    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor="middle" 
        dominantBaseline="central"
        style={{ fontSize: '12px', fontWeight: 'bold' }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // If no data, show a message
  if (bodyPartData.length === 0) {
    return (
      <div className="empty-chart-message">
        <p>No body part data available.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={bodyPartData.length > 0 ? bodyPartData : alternateData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius="70%"
          innerRadius="30%"
          fill="#8884d8"
          dataKey="value"
        >
          {bodyPartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value: number, name: string) => {
            return [`${value} exercises`, name];
          }}
        />
        <Legend verticalAlign="bottom" height={36} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default BodyPartDistributionChart;