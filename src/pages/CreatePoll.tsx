import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clipboard, ChevronLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import NavBar from '../components/NavBar';
import CreatePollForm from '../components/CreatePollForm';
import { PollType, Poll } from '../types';

const CreatePoll: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [similarPolls, setSimilarPolls] = useState<Poll[]>([]);
  const [showSimilarPollsModal, setShowSimilarPollsModal] = useState(false);
  const [forceCreate, setForceCreate] = useState(false);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleSimilarPollsFound = (polls: Poll[]) => {
    setSimilarPolls(polls);
    setShowSimilarPollsModal(true);
  };

  const handleContinueCreating = () => {
    setForceCreate(true);
    setShowSimilarPollsModal(false);
    // The form submission will now proceed since forceCreate is true
  };

  const handleCloseSimilarPollsModal = () => {
    setShowSimilarPollsModal(false);
    setSimilarPolls([]);
  };

  const handleViewSuggestedPoll = (pollId: string) => {
    navigate(`/poll/${pollId}`);
  };
  
  const handleSubmit = async (pollData: {
    question: string;
    description?: string;
    type: PollType;
    category: string;
    minValue?: number;
    maxValue?: number;
    options?: { text: string }[];
    demographicFilters: string[];
  }) => {
    if (!user) {
      setError('You must be logged in to create a poll');
      return;
    }

    // Check if we have similar polls and user hasn't chosen to force create
    if (similarPolls.length > 0 && !forceCreate) {
      handleSimilarPollsFound(similarPolls);
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // First, insert the poll
      const { data: poll, error: pollError } = await supabase
        .from('polls')
        .insert({
          creator_id: user.id,
          question: pollData.question,
          description: pollData.description || null,
          type: pollData.type,
          category: pollData.category,
          min_value: pollData.minValue || null,
          max_value: pollData.maxValue || null,
          demographic_filters: pollData.demographicFilters
        })
        .select()
        .single();
      
      if (pollError) throw pollError;
      
      // If it's a choice type poll, insert the options
      if (pollData.type === 'choice' && pollData.options && pollData.options.length > 0) {
        const optionsToInsert = pollData.options.map(option => ({
          poll_id: poll.id,
          text: option.text
        }));
        
        const { error: optionsError } = await supabase
          .from('poll_options')
          .insert(optionsToInsert);
          
        if (optionsError) throw optionsError;
      }
      
      // Reset forceCreate flag after successful creation
      setForceCreate(false);
      
      // Navigate to the new poll
      navigate(`/poll/${poll.id}`);
    } catch (err) {
      console.error('Error creating poll:', err);
      setError(err instanceof Error ? err.message : 'Failed to create poll');
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavBar />
      
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-10">
        {/* Go Back Button */}
        <button
          onClick={handleGoBack}
          className="mb-4 flex items-center text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          <span className="text-sm">Back</span>
        </button>

        <div className="flex items-center mb-6">
          <Clipboard className="h-6 w-6 sm:h-7 sm:w-7 text-blue-500 mr-3" />
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Create Poll</h1>
        </div>
        
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200 text-center">
              {error}
            </p>
          </div>
        )}
        
        {isSubmitting ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">Creating your poll...</p>
          </div>
        ) : (
          <CreatePollForm
            onSubmit={handleSubmit}
            onSimilarPollsFound={handleSimilarPollsFound}
            onContinueCreating={handleContinueCreating}
            similarPolls={similarPolls}
            showSimilarPollsModal={showSimilarPollsModal}
            onCloseSimilarPollsModal={handleCloseSimilarPollsModal}
            onViewSuggestedPoll={handleViewSuggestedPoll}
          />
        )}
      </main>
    </div>
  );
};

export default CreatePoll;