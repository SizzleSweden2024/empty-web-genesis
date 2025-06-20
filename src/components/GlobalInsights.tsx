import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Poll } from '../types';
import { getPollStats } from '../lib/supabase';
import { generateGlobalInsights, GlobalInsight } from '../utils/insightTemplates';

interface GlobalInsightsProps {
  poll: Poll;
  className?: string;
}

const GlobalInsights: React.FC<GlobalInsightsProps> = ({ poll, className = '' }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['poll-stats', poll.id],
    queryFn: () => getPollStats(poll.id),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading || !stats) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
    );
  }

  const insights = generateGlobalInsights(poll, stats);

  // Always show something meaningful, even if no specific insights
  if (insights.length === 0) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-start space-x-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
          <span className="text-lg flex-shrink-0 mt-0.5">📊</span>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            This poll is collecting responses from the community. {stats.count > 0 ? `${stats.count} ${stats.count === 1 ? 'person has' : 'people have'} shared their thoughts so far.` : 'Be the first to share your thoughts!'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {insights.map((insight, index) => (
        <InsightItem key={index} insight={insight} />
      ))}
    </div>
  );
};

interface InsightItemProps {
  insight: GlobalInsight;
}

const InsightItem: React.FC<InsightItemProps> = ({ insight }) => {
  return (
    <div className="flex items-start space-x-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
      <span className="text-lg flex-shrink-0 mt-0.5">{insight.icon}</span>
      <p className={`text-sm ${insight.color} dark:opacity-90 leading-relaxed`}>
        {insight.text}
      </p>
    </div>
  );
};

export default GlobalInsights;