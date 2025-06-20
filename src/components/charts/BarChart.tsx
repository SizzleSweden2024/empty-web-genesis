import React from 'react';
import { Distribution } from '../../types';

interface BarChartProps {
  distribution: Distribution;
  color?: string;
  height?: number;
  horizontal?: boolean;
  userResponseValue?: any;
}

const BarChart: React.FC<BarChartProps> = ({ 
  distribution, 
  color = '#3B82F6', 
  height = 300,
  horizontal = false,
  userResponseValue
}) => {
  const { labels, values } = distribution;
  const total = values.reduce((sum, value) => sum + value, 0);
  
  // Find the maximum value for scaling
  const maxValue = Math.max(...values);
  
  // Helper function to check if this bar represents the user's response
  const isUserResponse = (label: string | number, index: number) => {
    if (userResponseValue === undefined || userResponseValue === null) return false;
    
    // For boolean responses
    if (typeof userResponseValue === 'boolean') {
      return (userResponseValue && label === 'Yes') || (!userResponseValue && label === 'No');
    }
    
    // For choice responses (string comparison)
    if (typeof userResponseValue === 'string') {
      return label === userResponseValue;
    }
    
    // For numeric/slider responses (check if value falls in this bucket)
    if (typeof userResponseValue === 'number') {
      // Extract range from label if it's a range format like "1-10"
      if (typeof label === 'string' && label.includes('-')) {
        const [min, max] = label.split('-').map(Number);
        return userResponseValue >= min && userResponseValue <= max;
      }
      // Direct comparison for exact values
      return label === userResponseValue;
    }
    
    return false;
  };
  
  if (values.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[200px]">
        <div className="text-center">
          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">📊</span>
          </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
          Not enough data to display this chart
        </p>
        </div>
      </div>
    );
  }
  
  if (horizontal) {
    return (
      <div className="w-full overflow-x-auto" style={{ minHeight: `${Math.max(labels.length * 50, 200)}px` }}>
        <div className="min-w-[300px]" style={{ height: `${labels.length * 50 + 40}px` }}>
          {labels.map((label, index) => {
            const percentage = total > 0 ? (values[index] / total) * 100 : 0;
            const barWidth = maxValue > 0 ? (values[index] / maxValue) * 100 : 0;
            const isUserBar = isUserResponse(label, index);
            
            return (
              <div key={index} className="flex items-center mb-3 last:mb-0">
                <div className="w-20 sm:w-24 pr-2 sm:pr-3 text-right">
                  <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 block truncate" title={String(label)}>
                    {label}
                  </span>
                </div>
                <div className="flex-1 flex items-center min-w-0">
                  <div className="flex-1 relative">
                    <div 
                      className={`h-8 sm:h-10 rounded-md transition-all duration-500 ease-in-out ${
                        isUserBar ? 'ring-2 ring-yellow-400 ring-offset-1 ring-offset-white dark:ring-offset-gray-800' : ''
                      }`}
                      style={{ 
                        width: `${Math.max(barWidth, values[index] > 0 ? 8 : 0)}%`, 
                        backgroundColor: isUserBar ? '#F59E0B' : color,
                        minWidth: values[index] > 0 ? '8px' : '0' 
                      }}
                    >
                      {/* Show percentage inside bar if there's enough space */}
                      {barWidth > 15 && (
                        <span className="absolute inset-0 flex items-center justify-center text-white text-xs sm:text-sm font-medium">
                          {percentage.toFixed(0)}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="ml-2 sm:ml-3 flex-shrink-0">
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {values[index]} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full" style={{ height: `${height}px`, minHeight: '200px' }}>
      <div className="flex h-full items-end pb-8 overflow-x-auto">
        <div className="flex h-full items-end min-w-full">
          {labels.map((label, index) => {
            const percentage = total > 0 ? (values[index] / total) * 100 : 0;
            const barHeight = maxValue > 0 ? Math.max((values[index] / maxValue) * 85, values[index] > 0 ? 4 : 0) : 0;
            const isUserBar = isUserResponse(label, index);
            
            return (
              <div key={index} className="flex flex-col items-center flex-1 h-full justify-end min-w-[60px] px-1">
                <div className="w-full relative mb-2" style={{ height: `${barHeight}%` }}>
                  {values[index] > 0 && (
                    <>
                      <div 
                        className={`w-full h-full rounded-t-md transition-all duration-500 ease-in-out ${
                          isUserBar ? 'ring-2 ring-yellow-400' : ''
                        }`}
                        style={{ 
                          backgroundColor: isUserBar ? '#F59E0B' : color,
                          minHeight: '4px'
                        }}
                      ></div>
                      {/* Show value on top of bar */}
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                        <span className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap bg-white dark:bg-gray-800 px-1 rounded">
                          {values[index]}
                        </span>
                      </div>
                    </>
                  )}
                </div>
                <div className="w-full text-center">
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1 font-medium">
                    {percentage.toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-800 dark:text-gray-200 leading-tight break-words" title={String(label)}>
                    {String(label).length > 8 ? `${String(label).substring(0, 8)}...` : String(label)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BarChart;