import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Label
} from 'recharts';
import { ProgressionLevel } from '../../../adaptiveEngine/types';

interface ProgressionLevelChartProps {
  progressionLevels: { date: Date; level: ProgressionLevel }[];
  timeRange: '7d' | '30d' | '90d' | 'all';
}

interface ChartDataPoint {
  date: string;
  originalDate: string;
  level: number;
  levelName: string;
}

// Map progression levels to numeric values and names
const progressionLevelMap: Record<ProgressionLevel, { value: number; name: string }> = {
  [ProgressionLevel.Deload]: { value: -1, name: 'Deload' },
  [ProgressionLevel.Maintenance]: { value: 0, name: 'Maintenance' },
  [ProgressionLevel.VerySlowProgress]: { value: 0.15, name: 'Very Slow Progress' },
  [ProgressionLevel.SlowProgress]: { value: 0.3, name: 'Slow Progress' },
  [ProgressionLevel.NormalProgress]: { value: 0.5, name: 'Normal Progress' },
  [ProgressionLevel.ModerateProgress]: { value: 0.65, name: 'Moderate Progress' },
  [ProgressionLevel.FastProgress]: { value: 0.8, name: 'Fast Progress' },
  [ProgressionLevel.Breakthrough]: { value: 1, name: 'Breakthrough' }
};

// Get progression level info from numeric value
const getProgressionLevelInfo = (level: number): { name: string; color: string } => {
  if (level < 0) return { name: 'Deload', color: '#e74c3c' };
  if (level === 0) return { name: 'Maintenance', color: '#f39c12' };
  if (level <= 0.2) return { name: 'Very Slow Progress', color: '#f1c40f' };
  if (level <= 0.4) return { name: 'Slow Progress', color: '#3498db' };
  if (level <= 0.6) return { name: 'Normal Progress', color: '#2ecc71' };
  if (level <= 0.7) return { name: 'Moderate Progress', color: '#27ae60' };
  if (level <= 0.9) return { name: 'Fast Progress', color: '#9b59b6' };
  return { name: 'Breakthrough', color: '#8e44ad' };
};

const ProgressionLevelChart: React.FC<ProgressionLevelChartProps> = ({ 
  progressionLevels,
  timeRange
}) => {
  // Process and format data for the chart
  const chartData = useMemo(() => {
    if (progressionLevels.length === 0) {
      // Generate mock data if no real data
      const mockData: ChartDataPoint[] = [];
      const now = new Date();
      const dataPoints = timeRange === '7d' ? 7 : timeRange === '30d' ? 10 : 15;
      
      // Start with a normal progression
      let mockLevel = 0.5;
      
      for (let i = dataPoints - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i * (timeRange === '7d' ? 1 : timeRange === '30d' ? 3 : 7));
        
        const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        const displayDate = `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
        
        // Simulated progression pattern with a deload in the middle
        if (i === Math.floor(dataPoints / 2)) {
          mockLevel = -1; // Deload
        } else if (i === Math.floor(dataPoints / 2) - 1) {
          mockLevel = 0; // Maintenance after deload
        } else {
          // Gradual increase with some variation
          mockLevel = Math.min(1, mockLevel + (Math.random() * 0.2 - 0.05));
        }
        
        const levelInfo = getProgressionLevelInfo(mockLevel);
        
        mockData.push({
          date: displayDate,
          originalDate: dateKey,
          level: mockLevel,
          levelName: levelInfo.name
        });
      }
      
      return mockData;
    }

    // Format real progression data
    return progressionLevels.map(item => {
      const date = item.date;
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const displayDate = `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
      
    // 方法1：使用类型断言
    const levelValue = typeof item.level === 'number' 
      ? item.level 
      : progressionLevelMap[item.level as ProgressionLevel]?.value || 0;

    const levelName = typeof item.level === 'number'
      ? getProgressionLevelInfo(levelValue).name
      : progressionLevelMap[item.level as ProgressionLevel]?.name || 'Unknown';
          
      return {
        date: displayDate,
        originalDate: dateKey,
        level: levelValue,
        levelName
      };
    }).sort((a, b) => a.originalDate.localeCompare(b.originalDate));
  }, [progressionLevels, timeRange]);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const level = payload[0].value;
      const levelInfo = getProgressionLevelInfo(level);
      
      return (
        <div className="custom-tooltip" style={{ 
          backgroundColor: 'white', 
          padding: '8px 12px', 
          border: '1px solid #ccc',
          borderRadius: '4px'
        }}>
          <p style={{ margin: 0 }}><strong>Date:</strong> {label}</p>
          <p style={{ 
            margin: '4px 0 0 0', 
            color: levelInfo.color,
            fontWeight: 'bold'
          }}>
            {levelInfo.name}
          </p>
        </div>
      );
    }
    
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          domain={[-1.1, 1.1]} 
          ticks={[-1, -0.5, 0, 0.15, 0.3, 0.5, 0.65, 0.8, 1]}
          tickFormatter={(value) => {
            if (value === -1) return 'Deload';
            if (value === 0) return 'Maint.';
            if (value === 0.5) return 'Normal';
            if (value === 1) return 'Breakt.';
            return '';
          }}
          tick={{ fontSize: 10 }}
        />
        <Tooltip content={<CustomTooltip />} />
        
        {/* Reference lines for progression levels */}
        <ReferenceLine y={-1} stroke="#e74c3c" strokeDasharray="3 3">
          <Label value="Deload" position="insideLeft" style={{ fontSize: 10 }} />
        </ReferenceLine>
        <ReferenceLine y={0} stroke="#f39c12" strokeDasharray="3 3">
          <Label value="Maintenance" position="insideLeft" style={{ fontSize: 10 }} />
        </ReferenceLine>
        <ReferenceLine y={0.5} stroke="#2ecc71" strokeDasharray="3 3">
          <Label value="Normal" position="insideLeft" style={{ fontSize: 10 }} />
        </ReferenceLine>
        <ReferenceLine y={1} stroke="#8e44ad" strokeDasharray="3 3">
          <Label value="Breakthrough" position="insideLeft" style={{ fontSize: 10 }} />
        </ReferenceLine>
        
        <Line
          type="stepAfter"
          dataKey="level"
          name="Progression Level"
          stroke="#3498db"
          strokeWidth={3}
          dot={{ 
            r: 6,
            fill: '#3498db', // 使用固定颜色
            stroke: 'white',
            strokeWidth: 2
          }}          
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ProgressionLevelChart;