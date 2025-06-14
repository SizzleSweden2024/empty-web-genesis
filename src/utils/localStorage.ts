// Utility functions for handling local storage

/**
 * Save a poll response to localStorage
 */
export const savePollResponse = (pollId: string, response: any) => {
  const responses = getPollResponses();
  responses[pollId] = {
    value: response,
    timestamp: new Date().toISOString()
  };
  localStorage.setItem('pollResponses', JSON.stringify(responses));
};

/**
 * Get all poll responses from localStorage
 */
export const getPollResponses = (): Record<string, {value: any, timestamp: string}> => {
  const responses = localStorage.getItem('pollResponses');
  return responses ? JSON.parse(responses) : {};
};

/**
 * Check if user has responded to a poll
 */
export const hasRespondedToPoll = (pollId: string): boolean => {
  const responses = getPollResponses();
  return !!responses[pollId];
};

/**
 * Clear all user data from localStorage
 */
export const clearUserData = () => {
  localStorage.clear();
};