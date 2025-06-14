import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Bookmark, BarChart2, User, Clock } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Poll } from '../types';
import { addBookmark, removeBookmark, isPollBookmarked } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useDarkMode } from '../hooks/useDarkMode';
import { getCategoryGradient } from '../utils/categoryGradients';

interface PollCardProps {
  poll: Poll;
  className?: string;
}

const PollCard: React.FC<PollCardProps> = ({ poll, className = '' }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { isDarkMode } = useDarkMode();
  const [bookmarked, setBookmarked] = useState(false);
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(false);
  
  const formattedDate = new Date(poll.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  // Fetch initial bookmark status when component mounts or user changes
  useEffect(() => {
    const fetchBookmarkStatus = async () => {
      if (user) {
        try {
          const isBookmarked = await isPollBookmarked(user.id, poll.id);
          setBookmarked(isBookmarked);
        } catch (error) {
          console.error('Error fetching bookmark status:', error);
        }
      } else {
        setBookmarked(false);
      }
    };

    fetchBookmarkStatus();
  }, [user, poll.id]);
  
  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if user is authenticated
    if (!user) {
      alert('Please sign in to bookmark polls');
      return;
    }

    setIsBookmarkLoading(true);
    
    try {
      if (bookmarked) {
        await removeBookmark(user.id, poll.id);
        setBookmarked(false);
      } else {
        await addBookmark(user.id, poll.id);
        setBookmarked(true);
      }
      
      // Invalidate bookmarks query to refresh the bookmarks page
      queryClient.invalidateQueries({ queryKey: ['bookmarked-polls', user.id] });
    } catch (error) {
      console.error('Error updating bookmark:', error);
      alert('Failed to update bookmark. Please try again.');
    } finally {
      setIsBookmarkLoading(false);
    }
  };
  
  const getPollTypeIcon = () => {
    switch (poll.type) {
      case 'boolean':
        return (
          <div className="flex items-center text-indigo-500">
            <span className="rounded-full h-2 w-2 bg-green-500 mr-1"></span>
            <span className="rounded-full h-2 w-2 bg-red-500 mr-1"></span>
            <span className="text-xs">Yes/No</span>
          </div>
        );
      case 'slider':
        return (
          <div className="flex items-center text-indigo-500">
            <div className="w-4 h-1 bg-gray-400 rounded-full mr-1"></div>
            <span className="text-xs">Slider</span>
          </div>
        );
      case 'numeric':
        return (
          <div className="flex items-center text-indigo-500">
            <div className="text-xs mr-1">#</div>
            <span className="text-xs">Numeric</span>
          </div>
        );
      case 'choice':
        return (
          <div className="flex items-center text-indigo-500">
            <div className="w-2 h-2 border border-gray-400 rounded-full mr-1"></div>
            <span className="text-xs">Choice</span>
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <Link to={`/poll/${poll.id}`} className="block">
      <div 
        className={`border border-blue-200 rounded-xl hover:bg-opacity-80 transition-all duration-200 overflow-hidden shadow-md ${className}`}
        style={{ 
          background: getCategoryGradient(poll.category, isDarkMode)
        }}
      >
        <div className="px-4 pt-3 pb-2">
          <div className="flex items-center text-xs mb-1" style={{ color: '#6366F1' }}>
            <User size={12} className="mr-1" />
            <span>Anonymous</span>
            <span className="mx-1">•</span>
            <Clock size={12} className="mr-1" />
            <span>{formattedDate}</span>
            <span className="mx-1">•</span>
            {getPollTypeIcon()}
          </div>
          
          <h3 className="text-base sm:text-lg font-medium text-black mb-1">{poll.question}</h3>
          
          {poll.description && (
            <p className="text-xs sm:text-sm mb-2 line-clamp-2 leading-tight" style={{ color: '#1e3a8a' }}>{poll.description}</p>
          )}
          
          <div className="flex justify-between items-center text-xs sm:text-xs border-t border-gray-200 pt-2 pb-1" style={{ color: '#1e3a8a' }}>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <MessageSquare size={12} className="sm:w-3.5 sm:h-3.5" />
                <span>{poll.responseCount}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleBookmark}
                disabled={isBookmarkLoading}
                className={`transition-colors duration-200 disabled:opacity-50 p-1 rounded-md hover:bg-gray-100 hover:bg-opacity-50 ${
                  bookmarked ? 'text-orange-400' : 'text-gray-400 hover:text-orange-400'
                }`}
                title={user ? (bookmarked ? 'Remove bookmark' : 'Add bookmark') : 'Sign in to bookmark'}
              >
                <Bookmark 
                  size={12} 
                  className="sm:w-3.5 sm:h-3.5" 
                  fill={bookmarked ? 'currentColor' : 'none'}
                />
              </button>
              
              <Link to={`/poll/${poll.id}/results`} onClick={(e) => e.stopPropagation()} className="text-blue-400 p-1 rounded-md hover:bg-gray-100 hover:bg-opacity-50 transition-colors">
                <BarChart2 size={12} className="sm:w-3.5 sm:h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PollCard;