import React, { useState } from 'react';
import { Poll } from '../types';
import { savePollResponse } from '../utils/localStorage';

interface PollResponseFormProps {
  poll: Poll;
  onSubmit: (response: any) => void;
  isSubmitting?: boolean;
}

const PollResponseForm: React.FC<PollResponseFormProps> = ({ poll, onSubmit, isSubmitting = false }) => {
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
    
    // Save response to localStorage
    savePollResponse(poll.id, response);
    
    // Call parent's onSubmit
    onSubmit(response);
  };
  
  const renderResponseInput = () => {
    switch (poll.type) {
      case 'boolean':
        return (
          <div className="flex justify-center space-x-4 py-6">
            <button
              type="button"
              onClick={() => setBooleanResponse(true)}
              className={`px-6 py-2 rounded-lg text-base font-medium transition-colors ${
                booleanResponse === true
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-black hover:bg-gray-300'
              }`}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => setBooleanResponse(false)}
              className={`px-6 py-2 rounded-lg text-base font-medium transition-colors ${
                booleanResponse === false
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-200 text-black hover:bg-gray-300'
              }`}
            >
              No
            </button>
          </div>
        );
        
      case 'slider':
        return (
          <div className="py-6">
            <div className="flex justify-between text-sm mb-2" style={{ color: '#F8FAFC' }}>
              <span>{poll.minValue || 0}</span>
              <span>{poll.maxValue || 100}</span>
            </div>
            <input
              type="range"
              min={poll.minValue || 0}
              max={poll.maxValue || 100}
              value={sliderResponse}
              onChange={(e) => setSliderResponse(Number(e.target.value))}
              className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="text-center mt-3">
              <span className="text-lg font-semibold text-black">{sliderResponse}</span>
            </div>
          </div>
        );
        
      case 'numeric':
        return (
          <div className="py-6">
            <div className="flex justify-center">
              <input
                type="number"
                value={numericResponse}
                onChange={(e) => setNumericResponse(e.target.value)}
                min={poll.minValue}
                max={poll.maxValue}
                placeholder="Enter a number"
                className="w-full max-w-xs px-4 py-2 text-center text-lg border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white text-black"
              />
            </div>
            {(poll.minValue !== undefined || poll.maxValue !== undefined) && (
              <div className="text-center mt-2 text-sm" style={{ color: '#1e3a8a' }}>
                {poll.minValue !== undefined && poll.maxValue !== undefined
                  ? `Range: ${poll.minValue} - ${poll.maxValue}`
                  : poll.minValue !== undefined
                  ? `Minimum: ${poll.minValue}`
                  : `Maximum: ${poll.maxValue}`}
              </div>
            )}
          </div>
        );
        
      case 'choice':
        return (
          <div className="py-3 space-y-2">
            {poll.options?.map((option) => (
              <div key={option.id}>
                <label className="flex items-center p-3 rounded-lg border border-gray-300 cursor-pointer hover:bg-gray-100 transition-colors">
                  <input
                    type="radio"
                    name="choice"
                    value={option.id}
                    checked={choiceResponse === option.id}
                    onChange={() => setChoiceResponse(option.id)}
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-black">{option.text}</span>
                </label>
              </div>
            ))}
          </div>
        );
        
      default:
        return <div>Unsupported poll type</div>;
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-3 sm:p-4 md:p-6">
      <h2 className="text-base sm:text-lg md:text-xl font-semibold mb-3 sm:mb-4 text-black text-center">
        {poll.question}
      </h2>
      
      {poll.description && (
        <p className="text-xs sm:text-sm mb-3 sm:mb-4 text-center" style={{ color: '#1e3a8a' }}>
          {poll.description}
        </p>
      )}
      
      {renderResponseInput()}
      
      {error && (
        <div className="text-center text-red-500 mb-2 sm:mb-3 text-xs sm:text-sm">
          {error}
        </div>
      )}
      
      <div className="flex justify-center mt-2 sm:mt-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 sm:px-5 py-1.5 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
        >
          {isSubmitting ? (
            <div className="flex items-center">
              <div className="w-3 h-3 sm:w-4 sm:h-4 border-t-2 border-b-2 border-white rounded-full animate-spin mr-1 sm:mr-2"></div>
              Submitting...
            </div>
          ) : (
            'Submit'
          )}
        </button>
      </div>
      
      <p className="mt-2 sm:mt-3 text-xs text-center" style={{ color: '#1e3a8a' }}>
        Your response is anonymous. After submitting, you'll see how others answered.
      </p>
    </form>
  );
};

export default PollResponseForm;