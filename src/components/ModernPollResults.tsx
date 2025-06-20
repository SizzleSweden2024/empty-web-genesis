import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart2, PieChart as PieChartIcon, Filter, TrendingUp, Users, Target, ArrowDown, Info } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Poll, FilterOptions } from '../types';
import { getPollStats } from '../lib/supabase';
import { hasRespondedToPoll } from '../utils/localStorage';
import PersonalizedInsights from './PersonalizedInsights';
import FilterPanel from './FilterPanel';
import BarChart from './charts/BarChart';
import PieChart from './charts/PieChart';

interface ModernPollResultsProps {
  poll: Poll;
}

const ModernPollResults: React.FC<ModernPollResultsProps> = ({ poll }) => {
  const [filters, setFilters] = useState<FilterOptions>({});
  const [chartType, setChartType] = useState<'bar' | 'pie'>(() => {
    // Smart default based on poll type
    return poll.type === 'choice' ? 'pie' : 'bar';
  });
  const [showFilters, setShowFilters] = useState(false);
  
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

  // Get user's response from localStorage
  const userResponse = React.useMemo(() => {
    if (!hasRespondedToPoll(poll.id)) return null;
    
    const responses = JSON.parse(localStorage.getItem('pollResponses') || '{}');
    const response = responses[poll.id];
    return response ? response.value : null;
  }, [poll.id]);
  
  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };
  
  const toggleChartType = () => {
    setChartType(chartType === 'bar' ? 'pie' : 'bar');
  };

  const getChartExplanation = () => {
    switch (poll.type) {
      case 'boolean':
        return {
          title: "Response Distribution",
          description: "This chart shows the percentage of people who answered 'Yes' vs 'No' to this question."
        };
      case 'choice':
        return {
          title: "Choice Breakdown",
          description: "Each section represents how many people selected each option. Larger sections = more popular choices."
        };
      case 'numeric':
        return {
          title: "Number Distribution",
          description: "This shows how responses are spread across different number ranges. Taller bars = more common responses."
        };
      case 'slider':
        return {
          title: "Rating Distribution",
          description: "This displays how people rated on the scale. Higher bars show the most common rating ranges."
        };
      default:
        return {
          title: "Results",
          description: "This chart shows how people responded to this question."
        };
    }
  };

  const formatStatValue = (value: number | undefined, precision: number = 1): string => {
    if (value === undefined) return 'N/A';
    return value.toFixed(precision);
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8"
      >
        <div className="flex justify-center items-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
          />
        </div>
      </motion.div>
    );
  }

  if (!stats) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 text-center"
      >
        <p className="text-gray-500 dark:text-gray-400">Unable to load results</p>
      </motion.div>
    );
  }

  const chartExplanation = getChartExplanation();

  return (
    <div className="space-y-6">
      {/* Personalized Insights */}
      {userResponse !== null && userResponse !== undefined && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-800"
        >
          <div className="flex items-center space-x-3 mb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center"
            >
              <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </motion.div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Your Personal Insights
            </h3>
          </div>
          <PersonalizedInsights poll={poll} userResponse={userResponse} />
        </motion.div>
      )}

      {/* Main Results Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-6 w-6 text-white" />
              <h3 className="text-xl font-semibold text-white">Community Results</h3>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-white">
                <Users className="h-5 w-5" />
                <span className="font-semibold">{stats.count.toLocaleString()}</span>
                <span className="text-blue-100">responses</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowFilters(!showFilters)}
                  className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                >
                  <Filter className="h-5 w-5 text-white" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleChartType}
                  className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                >
                  {chartType === 'bar' ? (
                    <PieChartIcon className="h-5 w-5 text-white" />
                  ) : (
                    <BarChart2 className="h-5 w-5 text-white" />
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-b border-gray-200 dark:border-gray-700"
            >
              <div className="p-6">
                <FilterPanel onFilterChange={handleFilterChange} activeFilters={filters} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        <div className="p-6">
          {stats.count > 0 ? (
            <div className="space-y-6">
              {/* Chart Explanation */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800"
              >
                <div className="flex items-start space-x-3">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                      {chartExplanation.title}
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      {chartExplanation.description}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Quick Stats */}
              {(stats.mean !== undefined || stats.median !== undefined) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="grid grid-cols-2 sm:grid-cols-4 gap-4"
                >
                  {stats.mean !== undefined && (
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">Average</p>
                      <p className="text-xl font-bold text-blue-900 dark:text-blue-100" title={formatStatValue(stats.mean, 2)}>
                        {formatStatValue(stats.mean)}
                      </p>
                    </div>
                  )}
                  
                  {stats.median !== undefined && (
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
                      <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-1">Median</p>
                      <p className="text-xl font-bold text-purple-900 dark:text-purple-100" title={formatStatValue(stats.median, 2)}>
                        {formatStatValue(stats.median)}
                      </p>
                    </div>
                  )}
                  
                  {stats.mode !== undefined && (
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
                      <p className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">Most Common</p>
                      <p className="text-xl font-bold text-green-900 dark:text-green-100 truncate" title={String(stats.mode)}>
                        {String(stats.mode)}
                      </p>
                    </div>
                  )}
                  
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-4 rounded-xl border border-orange-200 dark:border-orange-800">
                    <p className="text-xs text-orange-600 dark:text-orange-400 font-medium mb-1">Total Responses</p>
                    <p className="text-xl font-bold text-orange-900 dark:text-orange-100">
                      {stats.count.toLocaleString()}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Chart Container */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Response Visualization
                  </h4>
                  <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                    <ArrowDown className="h-4 w-4" />
                    <span>Scroll to explore</span>
                  </div>
                </div>
                
                <div 
                  className="w-full overflow-auto"
                  style={{ 
                    height: chartType === 'pie' ? 'auto' : 
                      poll.type === 'choice' ? '400px' : '350px',
                    minHeight: chartType === 'pie' ? '350px' : '300px'
                  }}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={chartType}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                    >
                      {chartType === 'bar' ? (
                        <BarChart 
                          distribution={stats.distribution} 
                          color="#3B82F6" 
                          horizontal={poll.type === 'choice'}
                          height={poll.type === 'choice' ? 400 : 350}
                          userResponseValue={userResponse}
                        />
                      ) : (
                        <PieChart 
                          distribution={stats.distribution} 
                          size={320} 
                          userResponseValue={userResponse}
                        />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart2 className="h-8 w-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No data available
              </h4>
              <p className="text-gray-500 dark:text-gray-400">
                No responses match the current filters.
              </p>
            </motion.div>
          )}
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700"
          >
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              📊 {stats.count.toLocaleString()} total responses recorded so far. 
              {stats.count < 20 && (
                <span className="text-yellow-600 dark:text-yellow-400 ml-1">
                  Results may not be representative due to small sample size.
                </span>
              )}
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default ModernPollResults;