import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, ArrowRight } from 'lucide-react';
import { Poll } from '../types';

interface ModernPollResponseFormProps {
  poll: Poll;
  onSubmit: (response: any) => void;
  isSubmitting?: boolean;
}

const ModernPollResponseForm: React.FC<ModernPollResponseFormProps> = ({ 
  poll, 
  onSubmit, 
  isSubmitting = false 
}) => {
  const [booleanResponse, setBooleanResponse] = useState<boolean | null>(null);
  const [sliderResponse, setSliderResponse] = useState<number>(
    poll.minValue !== undefined ? Math.floor((poll.minValue + (poll.maxValue || 100)) / 2) : 50
  );
  const [numericResponse, setNumericResponse] = useState<string>('');
  const [choiceResponse, setChoiceResponse] = useState<string>('');
  const [error, setError] = useState<string>('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    let response;
    
    switch (poll.type) {
      case 'boolean':
        if (booleanResponse === null) {
          setError('Please select Yes or No');
          return;
        }
        response = booleanResponse;
        break;
        
      case 'slider':
        response = sliderResponse;
        break;
        
      case 'numeric':
        if (!numericResponse) {
          setError('Please enter a numeric value');
          return;
        }
        
        const numValue = Number(numericResponse);
        
        if (isNaN(numValue)) {
          setError('Please enter a valid number');
          return;
        }
        
        if (poll.minValue !== undefined && numValue < poll.minValue) {
          setError(`Value must be at least ${poll.minValue}`);
          return;
        }
        
        if (poll.maxValue !== undefined && numValue > poll.maxValue) {
          setError(`Value must be at most ${poll.maxValue}`);
          return;
        }
        
        response = numValue;
        break;
        
      case 'choice':
        if (!choiceResponse) {
          setError('Please select an option');
          return;
        }
        response = choiceResponse;
        break;
        
      default:
        setError('Unknown poll type');
        return;
    }
    
    onSubmit(response);
  };
  
  const renderResponseInput = () => {
    switch (poll.type) {
      case 'boolean':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="text-center mb-6">
              <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                Choose your answer
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Select Yes or No to share your response
              </p>
            </div>
            
            <div className="flex justify-center space-x-4">
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setBooleanResponse(true)}
                className={`px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-200 ${
                  booleanResponse === true
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                ✓ Yes
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setBooleanResponse(false)}
                className={`px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-200 ${
                  booleanResponse === false
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                ✗ No
              </motion.button>
            </div>
          </motion.div>
        );
        
      case 'slider':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rate on a scale
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Drag the slider to select your rating
              </p>
            </div>
            
            <div className="px-4">
              <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
                <span>{poll.minValue || 0}</span>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {sliderResponse}
                </span>
                <span>{poll.maxValue || 100}</span>
              </div>
              
              <div className="relative">
                <input
                  type="range"
                  min={poll.minValue || 0}
                  max={poll.maxValue || 100}
                  value={sliderResponse}
                  onChange={(e) => setSliderResponse(Number(e.target.value))}
                  className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${
                      ((sliderResponse - (poll.minValue || 0)) / ((poll.maxValue || 100) - (poll.minValue || 0))) * 100
                    }%, #E5E7EB ${
                      ((sliderResponse - (poll.minValue || 0)) / ((poll.maxValue || 100) - (poll.minValue || 0))) * 100
                    }%, #E5E7EB 100%)`
                  }}
                />
              </div>
            </div>
          </motion.div>
        );
        
      case 'numeric':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                Enter a number
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Type your numeric response below
              </p>
            </div>
            
            <div className="flex justify-center">
              <div className="relative">
                <input
                  type="number"
                  value={numericResponse}
                  onChange={(e) => setNumericResponse(e.target.value)}
                  min={poll.minValue}
                  max={poll.maxValue}
                  placeholder="Enter number..."
                  className="w-64 px-6 py-4 text-center text-2xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-200"
                />
                {(poll.minValue !== undefined || poll.maxValue !== undefined) && (
                  <div className="text-center mt-3 text-sm text-gray-500 dark:text-gray-400">
                    {poll.minValue !== undefined && poll.maxValue !== undefined
                      ? `Range: ${poll.minValue} - ${poll.maxValue}`
                      : poll.minValue !== undefined
                      ? `Minimum: ${poll.minValue}`
                      : `Maximum: ${poll.maxValue}`}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        );
        
      case 'choice':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="text-center mb-6">
              <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select an option
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Choose the option that best represents your answer
              </p>
            </div>
            
            <div className="space-y-3">
              {poll.options?.map((option, index) => (
                <motion.div
                  key={option.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <label className={`flex items-center p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                    choiceResponse === option.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}>
                    <input
                      type="radio"
                      name="choice"
                      value={option.id}
                      checked={choiceResponse === option.id}
                      onChange={() => setChoiceResponse(option.id)}
                      className="h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500 mr-4"
                    />
                    <span className="text-gray-900 dark:text-white font-medium flex-1">
                      {option.text}
                    </span>
                    {choiceResponse === option.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-blue-500"
                      >
                        ✓
                      </motion.div>
                    )}
                  </label>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );
        
      default:
        return <div>Unsupported poll type</div>;
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
        <h3 className="text-xl font-semibold text-white text-center">
          Share Your Response
        </h3>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 sm:p-8">
        {renderResponseInput()}
        
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800"
            >
              <p className="text-red-800 dark:text-red-200 text-center font-medium">
                {error}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="flex justify-center mt-8">
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
            whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Submit Response
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </motion.button>
        </div>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400"
        >
          🔒 Your response is anonymous and secure. After submitting, you'll see personalized insights about how your answer compares to others.
        </motion.p>
      </form>
    </motion.div>
  );
};

export default ModernPollResponseForm;