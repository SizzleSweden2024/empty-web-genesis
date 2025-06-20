import React, { useState } from 'react';
import { BarChart2, PieChart as PieChartIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Poll, FilterOptions } from '../types';
import { getPollStats } from '../lib/supabase';
import FilterPanel from './FilterPanel';
import PersonalizedInsights from './PersonalizedInsights';
import BarChart from './charts/BarChart';
import PieChart from './charts/PieChart';

interface PollResultsProps {
  poll: Poll;
  userResponse?: any;
}

const PollResults: React.FC<PollResultsProps> = ({ poll, userResponse }) => {
  const [filters, setFilters] = useState<FilterOptions>({});
  
  // Intelligent default chart type selection based on poll type
  const getDefaultChartType = (pollType: string): 'bar' | 'pie' => {
    switch (pollType) {
      case 'choice':
        return 'pie';
      case 'boolean':
      case 'numeric':
      case 'slider':
      default:
        return 'bar';
    }
  };
  
  const [chartType, setChartType] = useState<'bar' | 'pie'>(getDefaultChartType(poll.type));
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ['poll-stats', poll.id, filters],
    queryFn: () => getPollStats(poll.id, {
      ageRange: filters.ageRange,
      gender: filters.gender,
      region: filters.region,
      occupation: filters.occupation
    }),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
  
  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };
  
  const toggleChartType = () => {
    setChartType(chartType === 'bar' ? 'pie' : 'bar');
  };
  
  // Helper function to format stat values
  const formatStatValue = (value: number | undefined, precision: number = 1): string => {
    if (value === undefined) return 'N/A';
    return value.toFixed(precision);
  };
  
  // Render appropriate stats based on poll type
  const renderStats = () => {
    if (!stats || isLoading) {
      return (
        <div className="flex justify-center items-center py-8 sm:py-12">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
          <h3 className="text-base sm:text-lg font-medium">Results</h3>
          <div className="flex items-center justify-between sm:justify-end space-x-2 sm:space-x-3">
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {stats.count.toLocaleString()} responses
            </span>
            <button 
              onClick={toggleChartType}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label={`Switch to ${chartType === 'bar' ? 'pie' : 'bar'} chart`}
            >
              {chartType === 'bar' ? (
                <PieChartIcon size={16} className="text-gray-500 dark:text-gray-400" />
              ) : (
                <BarChart2 size={16} className="text-gray-500 dark:text-gray-400" />
              )}
            </button>
          </div>
        </div>
        
        {stats.count > 0 ? (
          <div className="space-y-4 sm:space-y-6">
            {/* Personalized Insights - only show if user has responded */}
            {userResponse !== undefined && userResponse !== null && (
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <PersonalizedInsights 
                  poll={poll} 
                  userResponse={userResponse}
                />
              </div>
            )}
            
            {/* Statistical Summary */}
            {(stats.mean !== undefined || stats.median !== undefined || stats.mode !== undefined) && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                {stats.mean !== undefined && (
                  <div className="bg-gray-50 dark:bg-gray-700 p-2 sm:p-3 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Mean</p>
                    <p className="text-sm sm:text-base font-semibold truncate" title={formatStatValue(stats.mean, 2)}>
                      {formatStatValue(stats.mean)}
                    </p>
                  </div>
                )}
                
                {stats.median !== undefined && (
                  <div className="bg-gray-50 dark:bg-gray-700 p-2 sm:p-3 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Median</p>
                    <p className="text-sm sm:text-base font-semibold truncate" title={formatStatValue(stats.median, 2)}>
                      {formatStatValue(stats.median)}
                    </p>
                  </div>
                )}
                
                {stats.mode !== undefined && (
                  <div className="bg-gray-50 dark:bg-gray-700 p-2 sm:p-3 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Mode</p>
                    <p className="text-sm sm:text-base font-semibold truncate" title={String(stats.mode)}>
                      {String(stats.mode)}
                    </p>
                  </div>
                )}
                
                <div className="bg-gray-50 dark:bg-gray-700 p-2 sm:p-3 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total</p>
                  <p className="text-sm sm:text-base font-semibold">
                    {stats.count.toLocaleString()}
                  </p>
                </div>
              </div>
            )}
            
            {/* Chart Container */}
            <div className="w-full">
              <div 
                className="w-full"
                style={{ 
                  height: chartType === 'pie' ? 'auto' : 
                    poll.type === 'choice' ? '300px' : '250px',
                  minHeight: chartType === 'pie' ? '300px' : '200px'
                }}
              >
                {chartType === 'bar' ? (
                  <BarChart 
                    distribution={stats.distribution} 
                    color="#3B82F6" 
                    horizontal={poll.type === 'choice'}
                    height={poll.type === 'choice' ? 300 : 250}
                    userResponseValue={userResponse}
                  />
                ) : (
                  <PieChart 
                    distribution={stats.distribution} 
                    size={280} 
                    userResponseValue={userResponse}
                  />
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12">
            <div className="text-gray-500 dark:text-gray-400 mb-2">
              <BarChart2 className="h-12 w-12 sm:h-16 sm:w-16 mx-auto opacity-50" />
            </div>
            <h4 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white mb-2">
              No data available
            </h4>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              No responses match the current filters.
            </p>
          </div>
        )}
        
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {stats.count.toLocaleString()} total responses recorded so far. 
            {stats.count < 20 && (
              <span className="text-yellow-600 dark:text-yellow-400">
                {' '}Results may not be representative due to small sample size.
              </span>
            )}
          </p>
        </div>
      </div>
    );
  };
  
  return (
    <div className="space-y-4 sm:space-y-6">
      <FilterPanel onFilterChange={handleFilterChange} activeFilters={filters} />
      {renderStats()}
    </div>
  );
};

export default PollResults;