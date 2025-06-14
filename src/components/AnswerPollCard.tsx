import React, { useState, useEffect } from 'react';
import { SkipBack as Skip, Eye, Share2, Twitter, Facebook, Link2 } from 'lucide-react';
import { Poll } from '../types';
import { hasRespondedToPoll, savePollResponse } from '../utils/localStorage';
import { createPollResponse } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import PollResponseForm from './PollResponseForm';
import PollResults from './PollResults';

interface AnswerPollCardProps {
  poll: Poll;
  questionNumber: number;
}

const AnswerPollCard: React.FC<AnswerPollCardProps> = ({ poll, questionNumber }) => {
  const { user } = useAuth();
  const [hasResponded, setHasResponded] = useState(false);
  const [userResponse, setUserResponse] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  useEffect(() => {
    const responded = hasRespondedToPoll(poll.id);
    setHasResponded(responded);
    
    // Get user's response from localStorage if they've responded
    if (responded) {
      const responses = JSON.parse(localStorage.getItem('pollResponses') || '{}');
      const response = responses[poll.id];
      if (response) {
        setUserResponse(response.value);
      }
    }
  }, [poll.id]);

  const handleSubmit = async (response: any) => {
    if (!user) {
      console.error('User must be logged in to submit response');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await createPollResponse(poll.id, user.id, response);
      savePollResponse(poll.id, response);
      setUserResponse(response);
      setHasResponded(true);
    } catch (error) {
      console.error('Failed to submit response:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    setHasResponded(true);
  };

  const handleShare = (platform: string) => {
    const pollUrl = `${window.location.origin}/poll/${poll.id}`;
    const text = `Check out this poll: "${poll.question}"`;
    
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(pollUrl)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pollUrl)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(pollUrl);
        setShowShareMenu(false);
        break;
    }
  };

  const getPollTypeDisplay = () => {
    switch (poll.type) {
      case 'boolean':
        return { icon: '✓', label: 'Yes/No', color: 'text-indigo-500' };
      case 'slider':
        return { icon: '⚡', label: 'Scale', color: 'text-indigo-500' };
      case 'numeric':
        return { icon: '#', label: 'Number', color: 'text-indigo-500' };
      case 'choice':
        return { icon: '◉', label: 'Choice', color: 'text-indigo-500' };
      default:
        return { icon: '?', label: 'Unknown', color: 'text-gray-400' };
    }
  };

  const typeDisplay = getPollTypeDisplay();

  return (
    <div className="bg-white border border-blue-200 rounded-xl overflow-hidden hover:bg-emerald-50 transition-colors shadow-md" style={{ backgroundColor: '#fffaf7' }}>
      {/* Header */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center mb-2">
              <span className="bg-blue-100 text-blue-600 text-xs font-semibold px-2 py-1 rounded-full mr-3">
                Question {questionNumber}
              </span>
              <span className={`${typeDisplay.color} text-xs font-medium flex items-center`}>
                <span className="mr-1">{typeDisplay.icon}</span>
                {typeDisplay.label}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-black mb-2 leading-tight">
              {poll.question}
            </h2>
            {poll.description && (
              <p className="text-xs sm:text-sm leading-relaxed" style={{ color: '#1e3a8a' }}>
                {poll.description}
              </p>
            )}
          </div>
          
          {hasResponded && (
            <div className="relative ml-4 flex-shrink-0">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="Share poll"
              >
                <Share2 className="h-4 w-4 text-gray-600" />
              </button>
              
              {showShareMenu && (
                <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10 min-w-[140px]">
                  <button
                    onClick={() => handleShare('twitter')}
                    className="w-full px-4 py-2 text-left text-sm text-black hover:bg-gray-100 flex items-center transition-colors"
                  >
                    <Twitter className="h-4 w-4 mr-2" />
                    Twitter
                  </button>
                  <button
                    onClick={() => handleShare('facebook')}
                    className="w-full px-4 py-2 text-left text-sm text-black hover:bg-gray-100 flex items-center transition-colors"
                  >
                    <Facebook className="h-4 w-4 mr-2" />
                    Facebook
                  </button>
                  <button
                    onClick={() => handleShare('copy')}
                    className="w-full px-4 py-2 text-left text-sm text-black hover:bg-gray-100 flex items-center transition-colors"
                  >
                    <Link2 className="h-4 w-4 mr-2" />
                    Copy Link
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6">
        {!hasResponded ? (
          <div>
            <PollResponseForm 
              poll={poll} 
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
            
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-4 pt-4 border-t border-gray-200 gap-2">
              <button
                onClick={handleSkip}
                className="flex items-center justify-center sm:justify-start px-3 py-1.5 sm:px-4 sm:py-2 text-gray-500 hover:text-black transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md"
              >
                <Skip className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Skip this question
              </button>
              
              <div className="text-xs text-center sm:text-right" style={{ color: '#1e3a8a' }}>
                {poll.responseCount.toLocaleString()} responses so far
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {userResponse && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center text-blue-600 text-sm">
                  <Eye className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="break-words">
                    Your answer: <span className="font-medium ml-1">
                      {typeof userResponse === 'boolean' 
                        ? (userResponse ? 'Yes' : 'No')
                        : userResponse.toString()}
                    </span>
                  </span>
                </div>
              </div>
            )}
            
            <div className="poll-results-container">
              <PollResults poll={poll} userResponse={userResponse} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnswerPollCard;