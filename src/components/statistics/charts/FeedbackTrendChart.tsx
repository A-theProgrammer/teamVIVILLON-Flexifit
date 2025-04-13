import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { UserFeedback } from '../../../adaptiveEngine/types';

interface FeedbackTrendChartProps {
  feedbackHistory: UserFeedback[];
  timeRange: '7d' | '30d' | '90d' | 'all';
}

interface AggregatedFeedback {
  date: string;
  originalDate: string;
  difficulty: number;
  fatigue: number;
  enjoyment: number;
  count: number;
}

const FeedbackTrendChart: React.FC<FeedbackTrendChartProps> = ({ 
  feedbackHistory,
  timeRange
}) => {
  // Process and aggregate feedback data
  const chartData = useMemo(() => {
    if (feedbackHistory.length === 0) {
      return [];
    }

    // Determine aggregation level based on time range
    let aggregationLevel: 'day' | 'week' | 'month';
    switch (timeRange) {
      case '7d':
        aggregationLevel = 'day';
        break;
      case '30d':
        aggregationLevel = 'day';
        break;
      case '90d':
        aggregationLevel = 'week';
        break;
      case 'all':
        aggregationLevel = 'month';
        break;
      default:
        aggregationLevel = 'day';
    }

    // Sort feedback by date
    const sortedFeedback = [...feedbackHistory].sort(
      (a, b) => a.completionTime - b.completionTime
    );

    // Group by aggregation level
    const aggregatedData: Record<string, AggregatedFeedback> = {};

    sortedFeedback.forEach(feedback => {
      const date = new Date(feedback.completionTime);
      let dateKey: string;
      let displayDate: string;

      if (aggregationLevel === 'day') {
        dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        displayDate = `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
      } else if (aggregationLevel === 'week') {
        // Get the first day of the week (Sunday)
        const day = date.getDay();
        const diff = date.getDate() - day;
        const firstDayOfWeek = new Date(date);
        firstDayOfWeek.setDate(diff);
        
        dateKey = `${firstDayOfWeek.getFullYear()}-W${Math.ceil((firstDayOfWeek.getDate() + firstDayOfWeek.getDay()) / 7)}`;
        displayDate = `W${Math.ceil((firstDayOfWeek.getDate() + firstDayOfWeek.getDay()) / 7)}`;
      } else {
        // Month aggregation
        dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        displayDate = date.toLocaleString('default', { month: 'short', year: '2-digit' });
      }

      if (!aggregatedData[dateKey]) {
        aggregatedData[dateKey] = {
          date: displayDate,
          originalDate: dateKey,
          difficulty: 0,
          fatigue: 0,
          enjoyment: 0,
          count: 0
        };
      }

      // Sum values for averaging later
      aggregatedData[dateKey].difficulty += feedback.difficulty;
      aggregatedData[dateKey].fatigue += feedback.fatigue;
      aggregatedData[dateKey].enjoyment += feedback.enjoyment;
      aggregatedData[dateKey].count += 1;
    });

    // Calculate averages and prepare final data
    return Object.values(aggregatedData)
      .map(data => ({
        ...data,
        difficulty: parseFloat((data.difficulty / data.count).toFixed(1)),
        fatigue: parseFloat((data.fatigue / data.count).toFixed(1)),
        enjoyment: parseFloat((data.enjoyment / data.count).toFixed(1))
      }))
      .sort((a, b) => a.originalDate.localeCompare(b.originalDate));
  }, [feedbackHistory, timeRange]);

  // If no data, show a message
  if (chartData.length === 0) {
    return (
      <div className="empty-chart-message">
        <p>No feedback data available for the selected time period.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={chartData}
        margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          domain={[0, 5]} 
          ticks={[1, 2, 3, 4, 5]}
          tick={{ fontSize: 12 }}
          label={{ value: 'Rating (1-5)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
        />
        <Tooltip 
          formatter={(value: number) => [`${value.toFixed(1)}/5`, '']}
          labelFormatter={(label) => `Date: ${label}`}
        />
        <Legend verticalAlign="top" height={36} />
        <Line
          type="monotone"
          dataKey="difficulty"
          name="Difficulty"
          stroke="#e74c3c"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="fatigue"
          name="Fatigue"
          stroke="#f39c12"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="enjoyment"
          name="Enjoyment"
          stroke="#2ecc71"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default FeedbackTrendChart;