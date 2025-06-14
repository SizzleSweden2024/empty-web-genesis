import React from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, BarChart3 } from 'lucide-react';
import NavBar from '../components/NavBar';
import PollResults from '../components/PollResults';
import { fetchPollById } from '../lib/supabase';
import { formatSupabasePoll } from '../utils/pollFormatters';

const PollResultsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: poll, isLoading, error } = useQuery({
    queryKey: ['poll', id],
    queryFn: async () => {
      if (!id) throw new Error('Poll ID is required');
      const data = await fetchPollById(id);
      return formatSupabasePoll(data);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleGoBack = () => {
    navigate(-1);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <p className="text-red-500 mb-4 text-sm sm:text-base">Failed to load poll results</p>
          <button
            onClick={handleGoBack}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }
  
  if (!poll) {
    return <Navigate to="/" />;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavBar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-10">
        {/* Go Back Button */}
        <button
          onClick={handleGoBack}
          className="mb-4 flex items-center text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md p-1"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          <span className="text-sm">Back</span>
        </button>

        {/* Poll Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm px-4 sm:px-6 py-4 sm:py-6 mb-6">
          <div className="flex items-center mb-3">
            <BarChart3 className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
            <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">Poll Results</span>
          </div>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white leading-tight">
            {poll.question}
          </h1>
          
          {poll.description && (
            <p className="mt-3 text-gray-600 dark:text-gray-300 text-sm sm:text-base leading-relaxed">
              {poll.description}
            </p>
          )}
        </div>
        
        {/* Poll Results */}
        <div className="poll-results-wrapper">
          <PollResults poll={poll} />
        </div>
      </main>
    </div>
  );
};

export default PollResultsPage;