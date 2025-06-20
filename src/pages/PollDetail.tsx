import React, { useState } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Users, Clock, BarChart3, TrendingUp, CheckCircle2, ArrowRight } from 'lucide-react';
import NavBar from '../components/NavBar';
import ModernPollResponseForm from '../components/ModernPollResponseForm';
import ModernPollResults from '../components/ModernPollResults';
import { fetchPollById, createPollResponse } from '../lib/supabase';
import { formatSupabasePoll } from '../utils/pollFormatters';
import { hasRespondedToPoll, savePollResponse } from '../utils/localStorage';
import { useAuth } from '../contexts/AuthContext';
import { useViewMode } from '../hooks/useViewMode';

const PollDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { viewMode } = useViewMode();
  const queryClient = useQueryClient();
  const [hasResponded, setHasResponded] = useState(hasRespondedToPoll(id || ''));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(hasResponded);
  
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
      setShowResults(true);
      
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

  const getPollTypeInfo = () => {
    if (!poll) return { icon: '❓', label: 'Unknown', color: 'text-gray-500' };
    
    switch (poll.type) {
      case 'boolean':
        return { icon: '✓', label: 'Yes/No Question', color: 'text-emerald-600' };
      case 'slider':
        return { icon: '⚡', label: 'Scale Rating', color: 'text-blue-600' };
      case 'numeric':
        return { icon: '#', label: 'Number Input', color: 'text-purple-600' };
      case 'choice':
        return { icon: '◉', label: 'Multiple Choice', color: 'text-orange-600' };
      default:
        return { icon: '❓', label: 'Unknown', color: 'text-gray-500' };
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 flex items-center justify-center">
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
          <p className="text-gray-600 dark:text-gray-300 font-medium">Loading poll...</p>
        </motion.div>
      </div>
    );
  }

  if (!poll) {
    return <Navigate to="/" />;
  }

  const typeInfo = getPollTypeInfo();
  
  // For mobile swipe view, use a more compact layout
  const isMobileSwipeView = viewMode === 'swipe' && window.innerWidth < 768;
  
  return (
    <div className={`min-h-screen ${isMobileSwipeView ? 'bg-gray-50 dark:bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900'}`}>
      <NavBar />
      
      <main className={`${isMobileSwipeView ? 'px-2 pt-16 pb-4' : 'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-10'}`}>
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={handleGoBack}
          className="mb-6 flex items-center text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
        >
          <ChevronLeft className="h-5 w-5 mr-1 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to polls</span>
        </motion.button>

        {/* Poll Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-8"
        >
          {/* Header Stats Bar */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-6">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="flex items-center space-x-2"
                >
                  <Users className="h-5 w-5" />
                  <span className="font-semibold">{poll.responseCount.toLocaleString()}</span>
                  <span className="text-blue-100">responses</span>
                </motion.div>
                
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="flex items-center space-x-2"
                >
                  <TrendingUp className="h-5 w-5" />
                  <span className="font-semibold">{poll.upvotes}</span>
                  <span className="text-blue-100">upvotes</span>
                </motion.div>
              </div>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center space-x-2 text-blue-100"
              >
                <Clock className="h-4 w-4" />
                <span className="text-sm">{formatDate(poll.createdAt)}</span>
              </motion.div>
            </div>
          </div>

          {/* Poll Content */}
          <div className="p-6 sm:p-8">
            {/* Poll Type Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-4"
            >
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${typeInfo.color} bg-gray-100 dark:bg-gray-700`}>
                <span className="mr-2">{typeInfo.icon}</span>
                {typeInfo.label}
              </span>
            </motion.div>

            {/* Question */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white leading-tight mb-4"
            >
              {poll.question}
            </motion.h1>
            
            {/* Description */}
            {poll.description && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-6"
              >
                {poll.description}
              </motion.p>
            )}

            {/* Category Tag */}
            {poll.category && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium"
              >
                <span className="mr-1">📂</span>
                {poll.category}
              </motion.div>
            )}
          </div>
        </motion.div>
        
        {/* Auth Check */}
        {!user ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl p-6 sm:p-8 border border-yellow-200 dark:border-yellow-800 mb-8"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7, type: "spring" }}
                className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/50 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Users className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              </motion.div>
              
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Join the conversation
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Sign in to share your thoughts and see how others responded
              </p>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/auth')}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Sign In to Participate
                <ArrowRight className="ml-2 h-5 w-5" />
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            {!showResults ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: 0.6 }}
              >
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 sm:p-6 border border-red-200 dark:border-red-800 mb-6"
                  >
                    <p className="text-red-800 dark:text-red-200 text-center font-medium">
                      {error}
                    </p>
                  </motion.div>
                )}
                
                <ModernPollResponseForm 
                  poll={poll} 
                  onSubmit={handlePollSubmit}
                  isSubmitting={isSubmitting}
                />
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-6"
              >
                {hasResponded && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-green-200 dark:border-green-800"
                  >
                    <div className="flex items-center justify-center space-x-3">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, type: "spring" }}
                      >
                        <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                      </motion.div>
                      <div className="text-center">
                        <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                          Response Recorded!
                        </h3>
                        <p className="text-green-700 dark:text-green-300">
                          Thanks for sharing your thoughts. Here's how others responded.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                <ModernPollResults poll={poll} />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>
    </div>
  );
};

export default PollDetail;