import React, { useState } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft } from 'lucide-react';
import NavBar from '../components/NavBar';
import PollResponseForm from '../components/PollResponseForm';
import PollResults from '../components/PollResults';
import { fetchPollById, createPollResponse } from '../lib/supabase';
import { formatSupabasePoll } from '../utils/pollFormatters';
import { hasRespondedToPoll, savePollResponse } from '../utils/localStorage';
import { useAuth } from '../contexts/AuthContext';

const PollDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [hasResponded, setHasResponded] = useState(hasRespondedToPoll(id || ''));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { data: poll, isLoading } = useQuery({
    queryKey: ['poll', id],
    queryFn: async () => {
      if (!id) throw new Error('Poll ID is required');
      const data = await fetchPollById(id);
      return formatSupabasePoll(data);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  const handlePollSubmit = async (response: any) => {
    if (!poll || !id || !user) {
      setError('You must be logged in to submit a response');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      
      await createPollResponse(id, user.id, response, {});
      savePollResponse(id, response);
      setHasResponded(true);
      
      // Invalidate related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['poll', id] });
      queryClient.invalidateQueries({ queryKey: ['polls'] });
      queryClient.invalidateQueries({ queryKey: ['insights'] });
    } catch (err) {
      console.error('Error submitting response:', err);
      // Show the specific error message from the backend
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit response';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white leading-tight">
            {poll.question}
          </h1>
          
          {poll.description && (
            <p className="mt-3 text-gray-600 dark:text-gray-300 text-sm sm:text-base leading-relaxed">
              {poll.description}
            </p>
          )}
        </div>
        
        {/* Auth Check */}
        {!user ? (
          <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 sm:p-6">
            <p className="text-yellow-800 dark:text-yellow-200 text-center text-sm sm:text-base mb-4">
              Please sign in to participate in this poll
            </p>
            <div className="flex justify-center">
              <button
                onClick={() => navigate('/auth')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow transition-colors duration-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Sign In to Answer
              </button>
            </div>
          </div>
        ) : hasResponded ? (
          <div className="space-y-6">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 sm:p-6">
              <p className="text-green-800 dark:text-green-200 text-center text-sm sm:text-base">
                Thanks for your response! Here's how others responded.
              </p>
            </div>
            <div className="poll-results-wrapper">
              <PollResults poll={poll} />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 sm:p-6">
                <p className="text-red-800 dark:text-red-200 text-center text-sm sm:text-base">
                  {error}
                </p>
              </div>
            )}
            <div className="poll-form-wrapper">
              <PollResponseForm 
                poll={poll} 
                onSubmit={handlePollSubmit}
                isSubmitting={isSubmitting}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PollDetail;