import React from 'react';
import { Poll } from '../types';
import { useDarkMode } from '../hooks/useDarkMode';
import { getCategoryGradient } from '../utils/categoryGradients';
import GlobalInsights from './GlobalInsights';

export interface PollTag {
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
}

interface DiscoverPollTileProps {
  poll: Poll;
  tags: PollTag[];
  onClick?: () => void;
  showResultsOnly?: boolean;
}

const DiscoverPollTile: React.FC<DiscoverPollTileProps> = ({ 
  poll, 
  tags,
  onClick,
  showResultsOnly = false
}) => {
  const { isDarkMode } = useDarkMode();
  
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`;
    return `${Math.floor(diffInDays / 30)}mo ago`;
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Default navigation behavior
      const targetUrl = showResultsOnly ? `/poll/${poll.id}/results` : `/poll/${poll.id}`;
      window.location.href = targetUrl;
    }
  };

  return (
    <div
      onClick={handleClick}
      className="rounded-xl shadow-sm p-4 border border-gray-200 dark:border-dark-700/50 hover:shadow-md transition-all duration-200 cursor-pointer group"
      style={{ 
        background: getCategoryGradient(poll.category, isDarkMode)
      }}
    >
      {/* Header with response count, tags, and date */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {/* Response count */}
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {poll.responseCount.toLocaleString()} responses
          </span>
          
          {/* Tags */}
          {tags.length > 0 && (
            <>
              {tags.map((tag, index) => {
                const Icon = tag.icon;
                return (
                  <div
                    key={index}
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${tag.color}`}
                  >
                    <Icon size={10} className="mr-1" />
                    {tag.label}
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Date */}
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {formatDate(poll.createdAt)}
        </span>
      </div>

      {/* Poll Question */}
      <div className="mb-4">
        <h3 className="text-gray-900 dark:text-white font-medium text-base leading-tight">
          {poll.question}
        </h3>
      </div>

      {/* Global Insights */}
      <div className="mb-4">
        <GlobalInsights poll={poll} />
      </div>
    </div>
  );
};

export default DiscoverPollTile;