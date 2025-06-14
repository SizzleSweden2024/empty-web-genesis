import React, { useState, useEffect } from 'react';
import { Distribution } from '../../types';

interface PieChartProps {
  distribution: Distribution;
  colors?: string[];
  size?: number;
  userResponseValue?: any;
}

const PieChart: React.FC<PieChartProps> = ({ 
  distribution, 
  colors = ['#3B82F6', '#F97316', '#10B981', '#8B5CF6', '#EC4899', '#F43F5E', '#06B6D4', '#14B8A6', '#6366F1'],
  size: initialSize = 250,
  userResponseValue
}) => {
  const { labels, values } = distribution;
  const total = values.reduce((sum, value) => sum + value, 0);
  const [size, setSize] = useState(initialSize);
  
  // Adjust size based on screen width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) { // sm breakpoint
        setSize(Math.min(initialSize * 0.8, 200));
      } else if (window.innerWidth < 768) { // md breakpoint
        setSize(Math.min(initialSize * 0.9, 220));
      } else {
        setSize(initialSize);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [initialSize]);
  
  // Helper function to check if this slice represents the user's response
  const isUserResponse = (label: string | number) => {
    if (userResponseValue === undefined || userResponseValue === null) return false;
    
    // For boolean responses
    if (typeof userResponseValue === 'boolean') {
      return (userResponseValue && label === 'Yes') || (!userResponseValue && label === 'No');
    }
    
    // For choice responses (string comparison)
    if (typeof userResponseValue === 'string') {
      return label === userResponseValue;
    }
    
    // For numeric responses, this is less common in pie charts but handle it
    if (typeof userResponseValue === 'number') {
      return label === userResponseValue;
    }
    
    return false;
  };
  
  if (values.length === 0 || total === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[200px]">
        <p className="text-gray-500 dark:text-gray-400 text-center text-xs sm:text-sm">
          Not enough data to display this chart
        </p>
      </div>
    );
  }
  
  // Calculate the percentages and angles for the pie slices
  let startAngle = 0;
  const slices = values.map((value, index) => {
    const percentage = (value / total) * 100;
    const angle = (value / total) * 360;
    const isLargeArc = angle > 180 ? 1 : 0;
    
    // Calculate the coordinates for the pie slice
    const x1 = size / 2 + (size / 2) * Math.cos((startAngle * Math.PI) / 180);
    const y1 = size / 2 + (size / 2) * Math.sin((startAngle * Math.PI) / 180);
    const x2 = size / 2 + (size / 2) * Math.cos(((startAngle + angle) * Math.PI) / 180);
    const y2 = size / 2 + (size / 2) * Math.sin(((startAngle + angle) * Math.PI) / 180);
    
    // Calculate the coordinates for the label (only for larger slices)
    const labelAngle = startAngle + angle / 2;
    const labelRadius = size / 2 * 0.67; // Place the label at 67% of the radius
    const labelX = size / 2 + labelRadius * Math.cos((labelAngle * Math.PI) / 180);
    const labelY = size / 2 + labelRadius * Math.sin((labelAngle * Math.PI) / 180);
    
    // Create the path for the pie slice
    const path = `M ${size / 2},${size / 2} L ${x1},${y1} A ${size / 2},${size / 2} 0 ${isLargeArc},1 ${x2},${y2} Z`;
    
    const slice = {
      path,
      color: isUserResponse(labels[index]) ? '#F59E0B' : colors[index % colors.length],
      percentage,
      label: labels[index],
      labelX,
      labelY,
      labelVisible: angle > 20, // Only show label if slice is large enough (increased threshold)
      isUserSlice: isUserResponse(labels[index])
    };
    
    startAngle += angle;
    return slice;
  });
  
  return (
    <div className="flex flex-col items-center w-full">
      <div className="flex justify-center mb-4">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="max-w-full h-auto">
          {slices.map((slice, index) => (
            <g key={index}>
              <path
                d={slice.path}
                fill={slice.color}
                stroke="#fff"
                strokeWidth="2"
                className={slice.isUserSlice ? 'drop-shadow-lg' : ''}
              />
              {/* Show labels on slices that are large enough */}
              {slice.labelVisible && (
                <text
                  x={slice.labelX}
                  y={slice.labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#fff"
                  fontSize={size < 200 ? "10" : "12"}
                  fontWeight="bold"
                  className="pointer-events-none"
                >
                  {slice.percentage.toFixed(0)}%
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>
      
      {/* Legend */}
      <div className="w-full max-w-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {slices.map((slice, index) => (
            <div 
              key={`legend-${index}`} 
              className={`flex items-center p-2 rounded-lg transition-all duration-200 ${
                slice.isUserSlice 
                  ? 'ring-2 ring-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' 
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }`}
            >
              <div 
                className="w-3 h-3 sm:w-4 sm:h-4 rounded-sm mr-2 flex-shrink-0" 
                style={{ backgroundColor: slice.color }}
              ></div>
              <div className="flex-1 min-w-0">
                <div className={`text-xs sm:text-sm font-medium truncate ${
                  slice.isUserSlice 
                    ? 'text-yellow-700 dark:text-yellow-300' 
                    : 'text-gray-700 dark:text-gray-300'
                }`} title={String(slice.label)}>
                  {slice.label}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {slice.percentage.toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PieChart;