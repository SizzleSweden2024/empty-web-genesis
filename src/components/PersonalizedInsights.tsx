import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Poll, UserDemographics } from '../types';
import { getPollStats } from '../lib/supabase';
import { generatePersonalizedInsights, PersonalizedInsight } from '../utils/insightTemplates';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface PersonalizedInsightsProps {
  poll: Poll;
  userResponse: any;
  className?: string;
}

const PersonalizedInsights: React.FC<PersonalizedInsightsProps> = ({ 
  poll, 
  userResponse, 
  className = '' 
}) => {
  const { user } = useAuth();

  // Fetch user demographics
  const { data: userDemographics } = useQuery<UserDemographics | null>({
    queryKey: ['user-demographics', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('age_range, gender, region, occupation')
        .eq('id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      
      return data ? {
        ageRange: data.age_range,
        gender: data.gender,
        region: data.region,
        occupation: data.occupation
      } : null;
    },
    enabled: !!user,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch poll stats
  const { data: stats, isLoading } = useQuery({
    queryKey: ['poll-stats', poll.id],
    queryFn: () => getPollStats(poll.id),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading || !stats || userResponse === undefined || userResponse === null) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
    );
  }

  const insights = generatePersonalizedInsights(poll, stats, userResponse, userDemographics || undefined);

  if (insights.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center space-x-2 mb-3">
        <span className="text-lg">🎯</span>
        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
          Your Response Insights
        </h4>
      </div>
      
      <div className="space-y-2">
        {insights.map((insight, index) => (
          <PersonalizedInsightItem key={index} insight={insight} />
        ))}
      </div>

      {!userDemographics?.ageRange && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            💡 <strong>Unlock deeper insights!</strong> Complete your profile with age, gender, and location in your <a href="/profile" className="underline hover:no-underline">profile settings</a> to see how your answers compare to people with similar backgrounds.
          </p>
        </div>
      )}
    </div>
  );
};

interface PersonalizedInsightItemProps {
  insight: PersonalizedInsight;
}

const PersonalizedInsightItem: React.FC<PersonalizedInsightItemProps> = ({ insight }) => {
  return (
    <div className={`flex items-start space-x-2 p-3 rounded-lg ${
      insight.isComparison 
        ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800' 
        : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
    }`}>
      <span className="text-lg flex-shrink-0 mt-0.5">{insight.icon}</span>
      <p className={`text-sm ${insight.color} dark:opacity-90 leading-relaxed font-medium`}>
        {insight.text}
      </p>
    </div>
  );
};

export default PersonalizedInsights;