import React, { useState, useEffect } from 'react';
import { useSpring, animated, config } from 'react-spring';
import { useDrag } from 'react-use-gesture';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Poll } from '../types';
import SwipeCard from './SwipeCard';
import { RefreshCw, Loader2 } from 'lucide-react';

interface SwipeInterfaceProps {
  polls: Poll[];
  isLoading?: boolean;
  hasNextPage?: boolean;
  fetchNextPage?: () => void;
  isFetchingNextPage?: boolean;
}

const SwipeInterface: React.FC<SwipeInterfaceProps> = ({
  polls,
  isLoading,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage
}) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  
  // Auto-fetch more polls when getting close to the end
  useEffect(() => {
    if (currentIndex >= polls.length - 3 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage?.();
    }
  }, [currentIndex, polls.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const [{ x, opacity }, api] = useSpring(() => ({
    x: 0,
    opacity: 1,
    config: config.wobbly
  }));

  const bind = useDrag(
    ({ active, movement: [mx], direction: [xDir], velocity: [vx] }) => {
      const trigger = Math.abs(mx) > 100 || Math.abs(vx) > 0.5;
      
      if (!active && trigger) {
        const dir = xDir > 0 ? 'right' : 'left';
        setDirection(dir);
        
        api.start({
          x: dir === 'right' ? 1000 : -1000,
          opacity: 0,
          config: config.default,
          onRest: () => {
            handleSwipe(dir);
          }
        });
      } else {
        api.start({
          x: active ? mx : 0,
          opacity: 1,
          immediate: active,
          config: active ? config.stiff : config.wobbly
        });
      }
    },
    {
      axis: 'x',
      bounds: { left: -200, right: 200 },
      rubberband: true
    }
  );

  const handleSwipe = (dir: 'left' | 'right') => {
    if (dir === 'right') {
      // Swipe right - go to poll detail
      const currentPoll = polls[currentIndex];
      if (currentPoll) {
        navigate(`/poll/${currentPoll.id}`);
        return;
      }
    }
    
    // Swipe left or no poll - go to next
    goToNext();
  };

  const goToNext = () => {
    if (currentIndex < polls.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setDirection(null);
      api.start({
        x: 0,
        opacity: 1,
        immediate: true
      });
    }
  };

  const handleCardTap = () => {
    const currentPoll = polls[currentIndex];
    if (currentPoll) {
      navigate(`/poll/${currentPoll.id}`);
    }
  };

  const handleRefresh = () => {
    setCurrentIndex(0);
    setDirection(null);
    api.start({
      x: 0,
      opacity: 1,
      immediate: true
    });
  };

  if (isLoading && polls.length === 0) {
    return (
      <div className="h-[600px] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center space-y-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
          />
          <p className="text-gray-600 dark:text-gray-300 font-medium">Loading polls...</p>
        </motion.div>
      </div>
    );
  }

  if (polls.length === 0) {
    return (
      <div className="h-[600px] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto">
            <span className="text-2xl">📊</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            No polls available
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Check back later for new questions to answer
          </p>
        </motion.div>
      </div>
    );
  }

  const currentPoll = polls[currentIndex];
  const nextPoll = polls[currentIndex + 1];

  if (currentIndex >= polls.length) {
    return (
      <div className="h-[600px] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
            <span className="text-3xl">🎉</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              You're all caught up!
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              You've seen all available polls. Check back later for new questions.
            </p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Start Over
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative h-[600px] overflow-hidden">
      {/* Progress Indicator */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
        <div className="bg-black/20 dark:bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
          <span className="text-white dark:text-gray-200 text-sm font-medium">
            {currentIndex + 1} / {polls.length}
          </span>
        </div>
      </div>

      {/* Loading indicator for fetching more */}
      {isFetchingNextPage && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
          <div className="bg-black/20 dark:bg-white/20 backdrop-blur-sm rounded-full px-3 py-2 flex items-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin text-white" />
            <span className="text-white text-sm">Loading more...</span>
          </div>
        </div>
      )}

      {/* Next card (background) */}
      {nextPoll && (
        <SwipeCard
          poll={nextPoll}
          isActive={false}
          style={{
            scale: 0.95,
            opacity: 0.5,
            zIndex: 1
          }}
        />
      )}

      {/* Current card */}
      {currentPoll && (
        <animated.div
          {...bind()}
          style={{
            x,
            opacity,
            zIndex: 2,
            position: 'absolute',
            inset: 0,
            touchAction: 'none'
          }}
        >
          <SwipeCard
            poll={currentPoll}
            onSwipeLeft={() => handleSwipe('left')}
            onSwipeRight={() => handleSwipe('right')}
            onTap={handleCardTap}
            isActive={true}
          />
        </animated.div>
      )}

      {/* Swipe Hints */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-between px-8 z-10 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 0.6, x: 0 }}
          className="bg-red-500/80 backdrop-blur-sm rounded-full px-3 py-2 text-white text-sm font-medium"
        >
          ← Skip
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 0.6, x: 0 }}
          className="bg-green-500/80 backdrop-blur-sm rounded-full px-3 py-2 text-white text-sm font-medium"
        >
          Answer →
        </motion.div>
      </div>
    </div>
  );
};

export default SwipeInterface;