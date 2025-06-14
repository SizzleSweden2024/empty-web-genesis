import React, { useState } from 'react';
import { Search, Clock, MessageSquare, TrendingUp, CheckCircle, Sparkles, Zap, Star, RefreshCw } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import NavBar from '../components/NavBar';
import PollCard from '../components/PollCard';
import AnswerPollCard from '../components/AnswerPollCard';
import InfiniteScrollContainer from '../components/InfiniteScrollContainer';
import DiscoverPollTile, { PollTag } from '../components/DiscoverPollTile';
import { getTodaysInsights } from '../lib/supabase';
import { useInfinitePolls, useAnswerPolls } from '../hooks/useInfinitePolls';
import { useAuth } from '../contexts/AuthContext';
import { PollCategory, Poll } from '../types';
import { generatePollInsight, PollInsight } from '../utils/pollInsights';

type Insight = {
  value: string;
  question: string;
  color: string;
};

const categories: PollCategory[] = ['All', 'Life', 'Work', 'Entertainment', 'Finance', 'Health', 'Relationships', 'Technology', 'Sports'];

// Helper component to wrap individual polls with insight generation
const PollInsightWrapper: React.FC<{ 
  poll: Poll; 
  getPollTags: (poll: Poll) => PollTag[];
  showResultsOnly?: boolean;
}> = ({ poll, getPollTags, showResultsOnly = false }) => {
  const { data: insight, isLoading } = useQuery<PollInsight>({
    queryKey: ['poll-insight', poll.id],
    queryFn: () => generatePollInsight(poll),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours (reduced from 48 for faster refresh)
    gcTime: 24 * 60 * 60 * 1000, // 24 hours cache time
  });

  if (isLoading || !insight) {
    return (
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-dark-700/50 flex items-center justify-center h-40">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const tags = getPollTags(poll);

  return (
    <DiscoverPollTile
      poll={poll}
      insight={insight}
      tags={tags}
      showResultsOnly={showResultsOnly}
      onClick={() => {
        const targetUrl = showResultsOnly ? `/poll/${poll.id}/results` : `/poll/${poll.id}`;
        window.location.href = targetUrl;
      }}
    />
  );
};

const Home: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'discover' | 'answer'>('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [discoverFilter, setDiscoverFilter] = useState<'answered' | 'popular'>('popular');

  // Helper function to format last updated time
  const formatLastUpdated = (timestamp: number) => {
    const now = Date.now();
    const diffInMs = now - timestamp;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  // Handle manual refresh of insights
  const handleRefreshInsights = () => {
    queryClient.invalidateQueries({ queryKey: ['insights'] });
  };

  // Fetch insights using React Query
  const { data: insights = [], dataUpdatedAt } = useQuery<Insight[]>({
    queryKey: ['insights'],
    queryFn: getTodaysInsights,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });

  // Infinite queries for different poll types
  const answeredPolls = useInfinitePolls(
    categoryFilter === 'All' ? undefined : categoryFilter,
    searchQuery,
    'answered',
    user?.id
  );

  const trendingPolls = useInfinitePolls(
    categoryFilter === 'All' ? undefined : categoryFilter,
    searchQuery,
    'trending'
  );

  const answerPolls = useAnswerPolls(
    categoryFilter === 'All' ? undefined : categoryFilter,
    searchQuery,
    user?.id // Pass user ID for proper filtering
  );

  // Helper function to determine poll tags
  const getPollTags = (poll: Poll): PollTag[] => {
    const tags: PollTag[] = [];
    const now = new Date();
    const createdDate = new Date(poll.createdAt);
    const daysSinceCreated = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);

    // New tag - polls created within last 3 days
    if (daysSinceCreated <= 3) {
      tags.push({
        label: 'New',
        icon: Sparkles,
        color: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
      });
    }

    // Popular tag - polls with high response count (top 20%)
    if (poll.responseCount >= 500) {
      tags.push({
        label: 'Popular',
        icon: Star,
        color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
      });
    }

    // Trending tag - polls with high upvotes relative to age
    const upvoteVelocity = poll.upvotes / Math.max(daysSinceCreated, 1);
    if (upvoteVelocity >= 20) {
      tags.push({
        label: 'Trending',
        icon: Zap,
        color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
      });
    }

    return tags;
  };

  const renderDiscoverContent = () => {
    if (discoverFilter === 'answered' && user) {
      const allAnsweredPolls = answeredPolls.data?.pages.flatMap(page => page.polls) || [];
      
      return (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Questions you've answered</h3>
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {allAnsweredPolls.length} polls
            </span>
          </div>
          
          {answeredPolls.isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            </div>
          ) : allAnsweredPolls.length === 0 ? (
            <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm p-6 text-center border border-gray-200 dark:border-dark-700/50">
              <MessageSquare className="h-10 w-10 text-gray-400 dark:text-dark-400 mx-auto mb-3" />
              <h4 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white mb-2">No answered questions yet</h4>
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                Start answering polls to see insights here.
              </p>
            </div>
          ) : (
            <InfiniteScrollContainer
              hasNextPage={answeredPolls.hasNextPage}
              isFetchingNextPage={answeredPolls.isFetchingNextPage}
              fetchNextPage={answeredPolls.fetchNextPage}
              className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            >
              {allAnsweredPolls.map(poll => (
                <PollInsightWrapper 
                  key={poll.id} 
                  poll={poll} 
                  getPollTags={getPollTags}
                  showResultsOnly={true}
                />
              ))}
            </InfiniteScrollContainer>
          )}
        </div>
      );
    } else {
      const allTrendingPolls = trendingPolls.data?.pages.flatMap(page => page.polls) || [];
      
      return (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Popular questions</h3>
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {allTrendingPolls.length} polls
            </span>
          </div>
          
          {trendingPolls.isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            </div>
          ) : allTrendingPolls.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No polls found
            </div>
          ) : (
            <InfiniteScrollContainer
              hasNextPage={trendingPolls.hasNextPage}
              isFetchingNextPage={trendingPolls.isFetchingNextPage}
              fetchNextPage={trendingPolls.fetchNextPage}
              className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            >
              {allTrendingPolls.map(poll => (
                <PollInsightWrapper 
                  key={poll.id} 
                  poll={poll} 
                  getPollTags={getPollTags}
                  showResultsOnly={false}
                />
              ))}
            </InfiniteScrollContainer>
          )}
        </div>
      );
    }
  };

  const renderAnswerContent = () => {
    const allAnswerPolls = answerPolls.data?.pages.flatMap(page => page.polls) || [];
    
    // Show sign-in prompt if user is not authenticated
    if (!user) {
      return (
        <div className="bg-white dark:bg-dark-800/50 backdrop-blur rounded-xl p-8 text-center border border-gray-200 dark:border-dark-700/50">
          <MessageSquare className="h-12 w-12 text-gray-400 dark:text-dark-400 mx-auto mb-4" />
          <h2 className="text-lg sm:text-xl font-medium text-gray-900 dark:text-white mb-2">Sign in to answer polls</h2>
          <p className="text-gray-500 dark:text-dark-300 text-sm mb-4">
            Join our community and share your thoughts on various topics.
          </p>
          <button
            onClick={() => window.location.href = '/auth'}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow transition-colors duration-200 text-sm font-medium"
          >
            Sign In to Start Answering
          </button>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-dark-800/50 backdrop-blur rounded-xl p-4 mb-6 border border-gray-200 dark:border-dark-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 mr-2" />
              <span className="text-gray-900 dark:text-white font-medium text-xs sm:text-sm">
                {allAnswerPolls.length} Unanswered Questions
              </span>
            </div>
            <div className="text-gray-500 dark:text-dark-300 text-xs hidden sm:block">
              No order required • Skip anytime
            </div>
          </div>
        </div>

        {answerPolls.isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : allAnswerPolls.length === 0 ? (
          <div className="bg-white dark:bg-dark-800/50 backdrop-blur rounded-xl p-8 text-center border border-gray-200 dark:border-dark-700/50">
            <MessageSquare className="h-12 w-12 text-gray-400 dark:text-dark-400 mx-auto mb-4" />
            <h2 className="text-lg sm:text-xl font-medium text-gray-900 dark:text-white mb-2">No unanswered questions</h2>
            <p className="text-gray-500 dark:text-dark-300 text-sm">
              You've answered all available questions in this category. Check back later for new questions!
            </p>
          </div>
        ) : (
          <InfiniteScrollContainer
            hasNextPage={answerPolls.hasNextPage}
            isFetchingNextPage={answerPolls.isFetchingNextPage}
            fetchNextPage={answerPolls.fetchNextPage}
            className="space-y-4 sm:space-y-6"
          >
            {allAnswerPolls.map((poll, index) => (
              <AnswerPollCard 
                key={poll.id} 
                poll={poll}
                questionNumber={index + 1}
              />
            ))}
          </InfiniteScrollContainer>
        )}
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-950">
      <NavBar />
      
      <main className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 pt-16 pb-10">
        {/* Today's Insights */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Today's Insights</h2>
              <button
                onClick={handleRefreshInsights}
                className="ml-2 p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="Refresh insights"
              >
                <RefreshCw size={14} />
              </button>
            </div>
            <div className="flex items-center text-gray-500 dark:text-dark-400 text-xs">
              <Clock size={12} className="mr-1" />
              <span>
                {dataUpdatedAt ? formatLastUpdated(dataUpdatedAt) : 'Loading...'}
              </span>
            </div>
          </div>
          
          <div className="overflow-x-auto pb-4 -mx-3 px-3">
            <div className="flex space-x-3">
              {insights.map((insight, index) => (
                <div
                  key={index}
                  className="flex-none w-32 h-32 sm:w-40 sm:h-40 bg-white dark:bg-dark-800/50 backdrop-blur rounded-xl p-3 border border-gray-200 dark:border-dark-700/50 hover:bg-gray-50 dark:hover:bg-dark-800/70 transition-all duration-200 cursor-pointer"
                >
                  <div className="h-full flex flex-col">
                    <div className={`text-${insight.color}-500 text-2xl sm:text-3xl font-bold mb-2`}>
                      {insight.value}
                    </div>
                    <p className="text-gray-600 dark:text-dark-300 text-xs sm:text-sm leading-tight mt-auto">
                      {insight.question}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-4">
          <div className="flex bg-gray-100 dark:bg-dark-800/50 rounded-xl p-1 max-w-md mx-auto">
            <button
              onClick={() => setActiveTab('answer')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'answer'
                  ? 'bg-white dark:bg-dark-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Answer Polls
            </button>
            <button
              onClick={() => setActiveTab('discover')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'discover'
                  ? 'bg-white dark:bg-dark-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Discover
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search polls, topics..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-dark-700 rounded-xl bg-white dark:bg-dark-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-6 px-2">
          <div className="overflow-x-auto pb-2">
            <div className="flex gap-2 min-w-max px-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setCategoryFilter(category)}
                className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                  categoryFilter === category
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-dark-800/50 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-700/50'
                }`}
              >
                {category}
              </button>
            ))}
            </div>
          </div>
        </div>

        {/* Discover Filter (only for discover tab) */}
        {activeTab === 'discover' && user && (
          <div className="mb-6">
            <div className="flex bg-gray-100 dark:bg-dark-800/50 rounded-xl p-1 max-w-xs mx-auto">
              <button
                onClick={() => setDiscoverFilter('popular')}
                className={`flex-1 py-1.5 px-2 text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center justify-center ${
                  discoverFilter === 'popular'
                    ? 'bg-white dark:bg-dark-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                Popular
              </button>
              <button
                onClick={() => setDiscoverFilter('answered')}
                className={`flex-1 py-1.5 px-2 text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center justify-center ${
                  discoverFilter === 'answered'
                    ? 'bg-white dark:bg-dark-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                Answered
              </button>
            </div>
          </div>
        )}
        
        {/* Content based on active tab */}
        {activeTab === 'discover' ? renderDiscoverContent() : renderAnswerContent()}
      </main>
    </div>
  );
};

export default Home;