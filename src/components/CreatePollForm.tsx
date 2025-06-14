import React, { useState, useEffect } from 'react';
import { PollType, PollCategory, Poll } from '../types';
import { fetchSimilarPolls } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { X, Search, ArrowRight, Loader2 } from 'lucide-react';

interface CreatePollFormProps {
  onSubmit: (pollData: {
    question: string;
    description?: string;
    type: PollType;
    category: string;
    minValue?: number;
    maxValue?: number;
    options?: { text: string }[];
    demographicFilters: string[];
  }) => void;
  onSimilarPollsFound: (polls: Poll[]) => void;
  onContinueCreating: () => void;
  similarPolls: Poll[];
  showSimilarPollsModal: boolean;
  onCloseSimilarPollsModal: () => void;
  onViewSuggestedPoll: (pollId: string) => void;
}

const categories: PollCategory[] = ['Life', 'Work', 'Entertainment', 'Finance', 'Health', 'Relationships', 'Technology', 'Sports'];

const CreatePollForm: React.FC<CreatePollFormProps> = ({
  onSubmit,
  onSimilarPollsFound,
  onContinueCreating,
  similarPolls,
  showSimilarPollsModal,
  onCloseSimilarPollsModal,
  onViewSuggestedPoll,
}) => {
  const { user } = useAuth();
  const [question, setQuestion] = useState('');
  const [description, setDescription] = useState('');
  const [pollType, setPollType] = useState<PollType>('boolean');
  const [selectedCategory, setSelectedCategory] = useState<string>('Life');
  const [minValue, setMinValue] = useState<string>('');
  const [maxValue, setMaxValue] = useState<string>('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [demographicFilters, setDemographicFilters] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCheckingSimilarity, setIsCheckingSimilarity] = useState(false);
  
  // Debounced search for similar polls
  useEffect(() => {
    if (!question.trim() || question.length < 10) {
      return;
    }

    const timeoutId = setTimeout(async () => {
      if (!user) return;
      
      setIsCheckingSimilarity(true);
      try {
        const foundSimilarPolls = await fetchSimilarPolls(question, user.id);
        if (foundSimilarPolls.length > 0) {
          onSimilarPollsFound(foundSimilarPolls);
        }
      } catch (error) {
        console.error('Error checking for similar polls:', error);
      } finally {
        setIsCheckingSimilarity(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [question, user, onSimilarPollsFound]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!question.trim()) {
      newErrors.question = 'Question is required';
    }
    
    if (question.length > 280) {
      newErrors.question = 'Question must be 280 characters or less';
    }
    
    if (description.length > 500) {
      newErrors.description = 'Description must be 500 characters or less';
    }
    
    if (pollType === 'numeric' || pollType === 'slider') {
      if (minValue && maxValue && Number(minValue) >= Number(maxValue)) {
        newErrors.range = 'Minimum value must be less than maximum value';
      }
    }
    
    if (pollType === 'choice') {
      const filledOptions = options.filter(opt => opt.trim());
      if (filledOptions.length < 2) {
        newErrors.options = 'At least 2 options are required';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const pollData = {
      question,
      description: description || undefined,
      type: pollType,
      category: selectedCategory,
      demographicFilters,
    } as any;
    
    if (pollType === 'numeric' || pollType === 'slider') {
      if (minValue) pollData.minValue = Number(minValue);
      if (maxValue) pollData.maxValue = Number(maxValue);
    }
    
    if (pollType === 'choice') {
      pollData.options = options
        .filter(option => option.trim())
        .map(text => ({ text }));
    }
    
    onSubmit(pollData);
  };
  
  const handleDemographicFilterChange = (filter: string) => {
    setDemographicFilters(prev => 
      prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };
  
  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    
    // If the last option has text, add a new empty option
    if (index === options.length - 1 && value.trim()) {
      newOptions.push('');
    }
    
    setOptions(newOptions);
  };
  
  return (
    <>
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-900 dark:text-white">Create a New Poll</h2>
        
        {/* Question */}
        <div className="mb-4">
          <label htmlFor="question" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Question <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g., How many hours do you sleep per night?"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              maxLength={280}
            />
            {isCheckingSimilarity && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              </div>
            )}
          </div>
          <div className="flex justify-between mt-1">
            {errors.question && <p className="text-red-500 text-xs">{errors.question}</p>}
            <p className="text-xs text-gray-500 dark:text-gray-400 ml-auto">{question.length}/280</p>
          </div>
        </div>
        
        {/* Description */}
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description (optional)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide additional context if needed"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            rows={3}
            maxLength={500}
          />
          <div className="flex justify-between mt-1">
            {errors.description && <p className="text-red-500 text-xs">{errors.description}</p>}
            <p className="text-xs text-gray-500 dark:text-gray-400 ml-auto">{description.length}/500</p>
          </div>
        </div>

        {/* Category */}
        <div className="mb-4">
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        
        {/* Poll Type */}
        <div className="mb-4 sm:mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Response Type <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setPollType('boolean')}
              className={`p-2 sm:p-3 rounded-lg border ${
                pollType === 'boolean'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex justify-center mb-1 sm:mb-2">
                <div className="flex space-x-1 sm:space-x-2">
                  <div className="h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-green-500"></div>
                  <div className="h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-red-500"></div>
                </div>
              </div>
              <span className="text-xs sm:text-sm font-medium">Yes/No</span>
            </button>
            
            <button
              type="button"
              onClick={() => setPollType('slider')}
              className={`p-2 sm:p-3 rounded-lg border ${
                pollType === 'slider'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex justify-center mb-1 sm:mb-2">
                <div className="w-8 sm:w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full relative">
                  <div className="absolute -top-1.5 left-1/2 transform -translate-x-1/2 w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 rounded-full"></div>
                </div>
              </div>
              <span className="text-xs sm:text-sm font-medium">Slider</span>
            </button>
            
            <button
              type="button"
              onClick={() => setPollType('numeric')}
              className={`p-2 sm:p-3 rounded-lg border ${
                pollType === 'numeric'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex justify-center mb-1 sm:mb-2">
                <div className="text-lg sm:text-xl font-bold">#</div>
              </div>
              <span className="text-xs sm:text-sm font-medium">Number</span>
            </button>
            
            <button
              type="button"
              onClick={() => setPollType('choice')}
              className={`p-2 sm:p-3 rounded-lg border ${
                pollType === 'choice'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex justify-center mb-1 sm:mb-2">
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center">
                    <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full border border-gray-400"></div>
                    <div className="w-6 sm:w-8 h-1 bg-gray-300 dark:bg-gray-600 ml-1"></div>
                  </div>
                  <div className="flex items-center">
                    <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full border border-gray-400 bg-blue-500"></div>
                    <div className="w-6 sm:w-8 h-1 bg-gray-300 dark:bg-gray-600 ml-1"></div>
                  </div>
                </div>
              </div>
              <span className="text-xs sm:text-sm font-medium">Choice</span>
            </button>
          </div>
        </div>
        
        {/* Poll Type Specific Options */}
        {(pollType === 'numeric' || pollType === 'slider') && (
          <div className="mb-4 sm:mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Value Range (optional)
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="minValue" className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Minimum
                </label>
                <input
                  type="number"
                  id="minValue"
                  value={minValue}
                  onChange={(e) => setMinValue(e.target.value)}
                  placeholder={pollType === 'slider' ? "0" : "Min value"}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
              </div>
              <div>
                <label htmlFor="maxValue" className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Maximum
                </label>
                <input
                  type="number"
                  id="maxValue"
                  value={maxValue}
                  onChange={(e) => setMaxValue(e.target.value)}
                  placeholder={pollType === 'slider' ? "100" : "Max value"}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
              </div>
            </div>
            {errors.range && <p className="text-red-500 text-xs mt-1">{errors.range}</p>}
          </div>
        )}
        
        {pollType === 'choice' && (
          <div className="mb-4 sm:mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Options <span className="text-red-500">*</span>
            </label>
            {options.map((option, index) => (
              <div key={index} className="mb-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
              </div>
            ))}
            {errors.options && <p className="text-red-500 text-xs mt-1">{errors.options}</p>}
          </div>
        )}
        
        {/* Demographic Filters */}
        <div className="mb-4 sm:mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Collect Demographics (optional)
          </label>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-3">
            Select which demographic information to collect with responses
          </p>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={demographicFilters.includes('ageRange')}
                onChange={() => handleDemographicFilterChange('ageRange')}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Age Range</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={demographicFilters.includes('gender')}
                onChange={() => handleDemographicFilterChange('gender')}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Gender</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={demographicFilters.includes('region')}
                onChange={() => handleDemographicFilterChange('region')}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Region</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={demographicFilters.includes('occupation')}
                onChange={() => handleDemographicFilterChange('occupation')}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Occupation</span>
            </label>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow transition-colors duration-200 text-sm"
          >
            Create Poll
          </button>
        </div>
      </form>

      {/* Similar Polls Modal */}
      {showSimilarPollsModal && similarPolls.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Search className="h-5 w-5 text-blue-500 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Similar polls found
                  </h3>
                </div>
                <button
                  onClick={onCloseSimilarPollsModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                We found some similar polls that might answer your question. Would you like to check them out first?
              </p>
              
              <div className="space-y-3 mb-6">
                {similarPolls.map((poll) => (
                  <div
                    key={poll.id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      {poll.question}
                    </h4>
                    {poll.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        {poll.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{poll.responseCount} responses</span>
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                          {poll.category}
                        </span>
                      </div>
                      <button
                        onClick={() => onViewSuggestedPoll(poll.id)}
                        className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        View Poll
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={onContinueCreating}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow transition-colors duration-200 text-sm font-medium"
                >
                  Continue Creating My Poll
                </button>
                <button
                  onClick={onCloseSimilarPollsModal}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md shadow transition-colors duration-200 text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CreatePollForm;