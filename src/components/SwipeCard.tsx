import React, { useState } from 'react';
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { useSpring, animated } from 'react-spring';
import { useDrag } from 'react-use-gesture';
import { Poll } from '../types';
import { Users, TrendingUp, Clock, ArrowLeft, ArrowRight, BarChart3 } from 'lucide-react';
import GlobalInsights from './GlobalInsights';
import PersonalizedInsights from './PersonalizedInsights';
import { getCategoryGradient } from '../utils/categoryGradients';
import { useDarkMode } from '../hooks/useDarkMode';
import { hasRespondedToPoll } from '../utils/localStorage';

interface SwipeCardProps {
  poll: Poll;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onTap?: () => void;
  isActive?: boolean;
  style?: any;
}

const SwipeCard: React.FC<SwipeCardProps> = ({ 
  poll, 
  onSwipeLeft, 
  onSwipeRight, 
  onTap,
  isActive = true,
  style 
}) => {
  const { isDarkMode } = useDarkMode();
  const [showResults, setShowResults] = useState(false);
  const hasResponded = hasRespondedToPoll(poll.id);
  
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return `${Math.floor(diffInDays / 7)}w ago`;
  };

  const getPollTypeInfo = () => {
    switch (poll.type) {
      case 'boolean':
        return { icon: '✓', label: 'Yes/No', color: 'text-emerald-600' };
      case 'slider':
        return { icon: '⚡', label: 'Scale', color: 'text-blue-600' };
      case 'numeric':
        return { icon: '#', label: 'Number', color: 'text-purple-600' };
      case 'choice':
        return { icon: '◉', label: 'Choice', color: 'text-orange-600' };
      default:
        return { icon: '❓', label: 'Unknown', color: 'text-gray-500' };
    }
  };

  const typeInfo = getPollTypeInfo();

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 100;
    
    if (info.offset.x > threshold) {
      onSwipeRight?.();
    } else if (info.offset.x < -threshold) {
      onSwipeLeft?.();
    }
  };

  const userResponse = React.useMemo(() => {
    if (!hasResponded) return null;
    
    const responses = JSON.parse(localStorage.getItem('pollResponses') || '{}');
    const response = responses[poll.id];
    return response ? response.value : null;
  }, [poll.id, hasResponded]);

  return (
    <animated.div style={style} className="absolute inset-0 flex items-center justify-center p-4">
      <motion.div
        drag={isActive ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
        style={{ x, rotate, opacity }}
        whileTap={{ scale: 0.95 }}
        onClick={onTap}
        className="w-full max-w-sm h-[600px] cursor-pointer"
      >
        <div 
          className="w-full h-full rounded-3xl shadow-2xl border-2 border-white dark:border-gray-700 overflow-hidden"
          style={{ 
            background: getCategoryGradient(poll.category, isDarkMode)
          }}
        >
          {/* Header */}
          <div className="p-6 pb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${typeInfo.color} bg-white/80 dark:bg-gray-800/80`}>
                  <span className="mr-1">{typeInfo.icon}</span>
                  {typeInfo.label}
                </span>
                {poll.category && (
                  <span className="px-2 py-1 rounded-full bg-white/60 dark:bg-gray-800/60 text-xs font-medium text-gray-700 dark:text-gray-300">
                    {poll.category}
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {formatDate(poll.createdAt)}
              </span>
            </div>

            {/* Question */}
            <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight mb-3">
              {poll.question}
            </h2>

            {poll.description && (
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                {poll.description}
              </p>
            )}
          </div>

          {/* Stats Bar */}
          <div className="px-6 py-3 bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {poll.responseCount.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <TrendingUp className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {poll.upvotes}
                  </span>
                </div>
              </div>
              
              {hasResponded && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowResults(!showResults);
                  }}
                  className="flex items-center space-x-1 px-2 py-1 rounded-full bg-white/60 dark:bg-gray-800/60 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-colors"
                >
                  <BarChart3 className="h-3 w-3" />
                  <span>{showResults ? 'Hide' : 'Results'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6 overflow-y-auto">
            {showResults && hasResponded ? (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  📊 Results & Insights
                </h3>
                
                {userResponse !== null && userResponse !== undefined && (
                  <div className="mb-4">
                    <PersonalizedInsights poll={poll} userResponse={userResponse} />
                  </div>
                )}
                
                <div className="bg-white/40 dark:bg-gray-800/40 rounded-xl p-4 backdrop-blur-sm">
                  <GlobalInsights poll={poll} />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  💭 Community Insights
                </h3>
                
                <div className="bg-white/40 dark:bg-gray-800/40 rounded-xl p-4 backdrop-blur-sm">
                  <GlobalInsights poll={poll} />
                </div>

                {hasResponded && (
                  <div className="bg-green-50/80 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                    <div className="flex items-center space-x-2 text-green-700 dark:text-green-300">
                      <span className="text-lg">✅</span>
                      <span className="text-sm font-medium">You've answered this question</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Actions */}
          <div className="p-6 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                <ArrowLeft className="h-4 w-4" />
                <span>Skip</span>
              </div>
              
              <div className="text-center">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Tap to view details
                </p>
                <div className="w-8 h-1 bg-white/60 dark:bg-gray-400/60 rounded-full mx-auto"></div>
              </div>
              
              <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                <span>Details</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </animated.div>
  );
};

export default SwipeCard;