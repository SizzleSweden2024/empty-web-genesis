import React, { useState } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, UserPlus, Sparkles, Target } from 'lucide-react';
import NavBar from '../components/NavBar';
import ModernPollResponseForm from '../components/ModernPollResponseForm';
import ModernPollResults from '../components/ModernPollResults';
import GlobalInsights from '../components/GlobalInsights';
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
    if (!poll || !id) {
      setError('Poll data is not available');
      return;
    }

    if (!user) {
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
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
        />
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
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={handleGoBack}
          className="mb-6 flex items-center text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md p-2"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          <span className="text-sm font-medium">Back</span>
        </motion.button>

        {/* Poll Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-8"
        >
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-6">
            <div className="flex items-center space-x-3 mb-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
              >
                <Sparkles className="h-5 w-5 text-white" />
              </motion.div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                  {poll.question}
                </h1>
                {poll.category && (
                  <span className="inline-block mt-2 px-3 py-1 bg-white/20 rounded-full text-white text-sm font-medium">
                    {poll.category}
                  </span>
                )}
              </div>
            </div>
            
            {poll.description && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-blue-100 text-base leading-relaxed"
              >
                {poll.description}
              </motion.p>
            )}
          </div>

          {/* Community Insights for Everyone */}
          <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
            <div className="flex items-center space-x-3 mb-4">
              <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Community Insights
              </h3>
            </div>
            <GlobalInsights poll={poll} />
          </div>
        </motion.div>
        
        {/* Content based on authentication and response status */}
        <AnimatePresence mode="wait">
          {!user ? (
            // Unauthenticated users see insights and sign-in prompt
            <motion.div
              key="unauthenticated"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Results for unauthenticated users */}
              <ModernPollResults poll={poll} showPersonalizedInsights={false} />
              
              {/* Sign-in prompt */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl p-6 border border-yellow-200 dark:border-yellow-800"
              >
                <div className="flex items-start space-x-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.3 }}
                    className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/50 rounded-full flex items-center justify-center flex-shrink-0"
                  >
                    <UserPlus className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      🚀 Unlock Personalized Insights
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                      Sign in to answer this poll and get personalized insights based on your demographics. 
                      See how your response compares to people with similar backgrounds, age groups, and locations.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/auth')}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        Sign In to Answer
                      </motion.button>
                      <button
                        onClick={() => navigate('/')}
                        className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                      >
                        Browse More Polls
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ) : hasResponded ? (
            // Authenticated users who have responded see full results
            <motion.div
              key="responded"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-green-200 dark:border-green-800"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                    <span className="text-2xl">✅</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
                      Thanks for your response!
                    </h3>
                    <p className="text-green-700 dark:text-green-300">
                      Here's how your answer compares to the community.
                    </p>
                  </div>
                </div>
              </motion.div>
              
              <ModernPollResults poll={poll} showPersonalizedInsights={true} />
            </motion.div>
          ) : (
            // Authenticated users who haven't responded see the form
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-6 border border-red-200 dark:border-red-800"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center">
                      <span className="text-red-600 dark:text-red-400">⚠️</span>
                    </div>
                    <p className="text-red-800 dark:text-red-200 font-medium">
                      {error}
                    </p>
                  </div>
                </motion.div>
              )}
              
              <ModernPollResponseForm 
                poll={poll} 
                onSubmit={handlePollSubmit}
                isSubmitting={isSubmitting}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default PollDetail;