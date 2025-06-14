import React from 'react';
import { Poll } from '../types';
import { PollInsight } from '../utils/pollInsights';
import { useDarkMode } from '../hooks/useDarkMode';
import { getCategoryGradient } from '../utils/categoryGradients';

export interface PollTag {
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
}

interface DiscoverPollTileProps {
  poll: Poll;
  insight: PollInsight;
  tags: PollTag[];
  onClick?: () => void;
  showResultsOnly?: boolean;
}

const DiscoverPollTile: React.FC<DiscoverPollTileProps> = ({ 
  poll, 
  insight, 
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

      {/* Main Insight - Styled like the image */}
      <div className="mb-4">
        {insight.hasData ? (
          // Format insights like in the image
          insight.description.includes('said yes') || insight.description.includes('said no') ? (
            // Boolean poll results: "43% No  57% Yes"
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <span className="text-lg font-bold text-red-500 mr-1">
                  {insight.description.includes('said no') ? insight.value : `${100 - parseInt(insight.value)}%`}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">No</span>
              </div>
              <div className="flex items-center">
                <span className="text-lg font-bold text-blue-500 mr-1">
                  {insight.description.includes('said yes') ? insight.value : `${100 - parseInt(insight.value)}%`}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">Yes</span>
              </div>
            </div>
          ) : insight.description.includes('chose') ? (
            // Choice poll results: "Social media leads with 43%"
            <div>
              <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                {insight.description.replace(`chose "`, '').replace(`" as their top answer`, ` leads with ${insight.value}`)}
              </div>
            </div>
          ) : (
            // Numeric/other results
            <div>
              <span className="text-lg font-bold text-blue-500 mr-2">{insight.value}</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">{insight.description}</span>
            </div>
          )
        ) : (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {insight.description}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscoverPollTile;