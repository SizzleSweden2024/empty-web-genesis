import React from 'react';
import { Bookmark, ChevronLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import PollCard from '../components/PollCard';
import { fetchPollById, fetchBookmarkedPollIds } from '../lib/supabase';
import { formatSupabasePoll } from '../utils/pollFormatters';
import { useAuth } from '../contexts/AuthContext';
import { useViewMode } from '../hooks/useViewMode';
import { Poll } from '../types';
import SwipeInterface from '../components/SwipeInterface';

const Bookmarks: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { viewMode } = useViewMode();

  const handleGoBack = () => {
    navigate(-1);
  };
  
  const { data: bookmarkedPolls = [], isLoading, error } = useQuery<Poll[]>({
    queryKey: ['bookmarked-polls', user?.id],
    queryFn: async () => {
      if (!user) {
        return [];
      }
      
      // Fetch bookmarked poll IDs
      const pollIds = await fetchBookmarkedPollIds(user.id);
      
      if (pollIds.length === 0) {
        return [];
      }
      
      // Fetch each bookmarked poll individually
      const pollPromises = pollIds.map(id => fetchPollById(id));
      const polls = await Promise.all(pollPromises);
      
      return polls.map(formatSupabasePoll);
    },
    enabled: !!user, // Only run the query if user is logged in
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Show sign-in prompt if user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-950">
        <NavBar />
        
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-10">
          {/* Go Back Button */}
          <button
            onClick={handleGoBack}
            className="mb-4 flex items-center text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            <span className="text-sm">Back</span>
          </button>

          <div className="flex items-center mb-6">
            <Bookmark className="h-6 w-6 sm:h-7 sm:w-7 text-blue-500 mr-3" />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Bookmarked Polls</h1>
          </div>
          
          <div className="bg-white dark:bg-dark-800 rounded-lg shadow-md p-8 text-center border border-gray-200 dark:border-dark-700/50">
            <Bookmark className="h-12 w-12 text-gray-400 dark:text-dark-400 mx-auto mb-4" />
            <h2 className="text-lg sm:text-xl font-medium text-gray-900 dark:text-white mb-2">Sign in to view bookmarks</h2>
            <p className="text-gray-500 dark:text-dark-300 text-sm mb-4">
              Create an account or sign in to bookmark polls and access them here.
            </p>
            <button
              onClick={() => navigate('/auth')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow transition-colors duration-200 text-sm font-medium"
            >
              Sign In to View Bookmarks
            </button>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-950">
      <NavBar />
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-10">
        {/* Go Back Button */}
        <button
          onClick={handleGoBack}
          className="mb-4 flex items-center text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          <span className="text-sm">Back</span>
        </button>

        <div className="flex items-center mb-6">
          <Bookmark className="h-6 w-6 sm:h-7 sm:w-7 text-blue-500 mr-3" />
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Bookmarked Polls</h1>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-red-700 dark:text-red-200">
            {error instanceof Error ? error.message : 'Failed to load bookmarked polls'}
          </div>
        ) : bookmarkedPolls.length === 0 ? (
          <div className="bg-white dark:bg-dark-800 rounded-lg shadow-md p-8 text-center border border-gray-200 dark:border-dark-700/50">
            <Bookmark className="h-12 w-12 text-gray-400 dark:text-dark-400 mx-auto mb-4" />
            <h2 className="text-lg sm:text-xl font-medium text-gray-900 dark:text-white mb-2">No bookmarks yet</h2>
            <p className="text-gray-500 dark:text-dark-300 text-sm">
              You haven't bookmarked any polls yet. Bookmark polls from the home page to see them here.
            </p>
          </div>
        ) : (
          <>
            {viewMode === 'swipe' ? (
              <div className="space-y-6">
                <div className="bg-white dark:bg-dark-800/50 backdrop-blur rounded-xl p-4 border border-gray-200 dark:border-dark-700/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Bookmark className="h-4 w-4 text-blue-500 mr-2" />
                      <span className="text-gray-900 dark:text-white font-medium text-sm">
                        Bookmarked Polls: {bookmarkedPolls.length}
                      </span>
                    </div>
                    <div className="text-gray-500 dark:text-dark-300 text-xs">
                      Swipe to browse • Tap to view
                    </div>
                  </div>
                </div>
                
                <SwipeInterface
                  polls={bookmarkedPolls}
                  isLoading={false}
                  hasNextPage={false}
                />
              </div>
            ) : (
              <div className="grid gap-3 sm:gap-4">
                {bookmarkedPolls.map(poll => (
                  <PollCard key={poll.id} poll={poll} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Bookmarks;