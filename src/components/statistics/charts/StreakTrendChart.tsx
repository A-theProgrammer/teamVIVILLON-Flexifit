import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

interface StreakTrendChartProps {
  streakData: { date: Date; value: number }[];
  timeRange: '7d' | '30d' | '90d' | 'all';
}

interface FormattedStreakData {
  date: string;
  originalDate: string;
  value: number;
}

const StreakTrendChart: React.FC<StreakTrendChartProps> = ({ 
  streakData,
  timeRange
}) => {
  // Process and format data for the chart
  const chartData = useMemo(() => {
    if (streakData.length === 0) {
      return [];
    }

    // Format data for chart
    return streakData.map(item => {
      const date = item.date;
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      
      let displayDate: string;
      if (timeRange === '7d') {
        // For 7 days, show day of week
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        displayDate = dayNames[date.getDay()];
      } else {
        // For longer periods, show month/day
        displayDate = `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
      }
      
      return {
        date: displayDate,
        originalDate: dateKey,
        value: item.value
      };
    }).sort((a, b) => a.originalDate.localeCompare(b.originalDate));
  }, [streakData, timeRange]);

  // If no data, show a message
  if (chartData.length === 0) {
    return (
      <div className="empty-chart-message">
        <p>No streak data available for the selected time period.</p>
      </div>
    );
  }

  // Find the maximum streak value for setting chart domain
  const maxStreak = Math.max(...chartData.map(item => item.value));
  const yAxisDomain = [0, Math.max(10, Math.ceil(maxStreak * 1.2))]; // Add 20% padding
  
  // Find average streak
  const averageStreak = chartData.reduce((sum, item) => sum + item.value, 0) / chartData.length;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={chartData}
        margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          domain={yAxisDomain}
          label={{ value: 'Days', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
          tick={{ fontSize: 12 }}
        />
        <Tooltip 
          formatter={(value: number) => [`${value} ${value === 1 ? 'day' : 'days'}`, 'Workout Streak']}
          labelFormatter={(label) => `Date: ${label}`}
        />
        
        {/* Reference line for average streak */}
        {averageStreak > 0 && (
          <ReferenceLine 
            y={averageStreak} 
            label={{ 
              value: `Avg: ${averageStreak.toFixed(1)}`, 
              position: 'right',
              fill: '#34495e',
              fontSize: 12
            }} 
            stroke="#34495e" 
            strokeDasharray="3 3" 
          />
        )}
        
        <defs>
          <linearGradient id="colorStreak" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3498db" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#3498db" stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        
        <Area
          type="monotone"
          dataKey="value"
          name="Workout Streak"
          stroke="#3498db"
          fillOpacity={1}
          fill="url(#colorStreak)"
          strokeWidth={2}
          dot={{ 
            r: 4,
            strokeWidth: 2,
            stroke: 'white',
            fill: '#3498db' // 使用固定颜色
          }}
          activeDot={{ r: 6 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default StreakTrendChart;