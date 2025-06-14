import React, { useState, useEffect } from 'react';
import { UserDemographics, AgeRange, Gender } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface DemographicFormProps {
  onComplete?: (demographics: UserDemographics) => void;
}

const DemographicForm: React.FC<DemographicFormProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const [demographics, setDemographics] = useState<UserDemographics>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadProfileData = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('age_range, gender, region, occupation')
          .eq('id', user.id)
          .maybeSingle();
        
        if (error) throw error;
        
        if (data) {
          setDemographics({
            ageRange: data.age_range as AgeRange,
            gender: data.gender as Gender,
            region: data.region,
            occupation: data.occupation
          });
        }
      } catch (err) {
        console.error('Error loading profile data:', err);
      }
    };
    
    loadProfileData();
  }, [user]);
  
  const handleAgeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as AgeRange | '';
    setDemographics(prev => ({
      ...prev,
      ageRange: value as AgeRange || undefined
    }));
  };
  
  const handleGenderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as Gender | '';
    setDemographics(prev => ({
      ...prev,
      gender: value as Gender || undefined
    }));
  };
  
  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setDemographics(prev => ({
      ...prev,
      region: value || undefined
    }));
  };
  
  const handleOccupationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setDemographics(prev => ({
      ...prev,
      occupation: value || undefined
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to update your demographics');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          age_range: demographics.ageRange || null,
          gender: demographics.gender || null,
          region: demographics.region || null,
          occupation: demographics.occupation || null
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      setSuccessMessage('Your demographic information has been saved');
      
      if (onComplete) {
        onComplete(demographics);
      }
    } catch (err) {
      console.error('Error updating demographics:', err);
      setError(err instanceof Error ? err.message : 'Failed to update demographics');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Optional Demographics</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Sharing your demographics helps provide context to poll results. This information is anonymous 
        and only used for aggregated statistics.
      </p>
      
      {!user ? (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg mb-4">
          <p className="text-yellow-800 dark:text-yellow-200 text-center">
            Please sign in to update your demographic information
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg mb-4">
              <p className="text-red-800 dark:text-red-200 text-center">{error}</p>
            </div>
          )}
          
          {successMessage && (
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-4">
              <p className="text-green-800 dark:text-green-200 text-center">{successMessage}</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="ageRange" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Age Range
              </label>
              <select
                id="ageRange"
                value={demographics.ageRange || ''}
                onChange={handleAgeChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Prefer not to say</option>
                <option value="18-24">18-24</option>
                <option value="25-34">25-34</option>
                <option value="35-44">35-44</option>
                <option value="45-54">45-54</option>
                <option value="55-64">55-64</option>
                <option value="65+">65+</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Gender
              </label>
              <select
                id="gender"
                value={demographics.gender || ''}
                onChange={handleGenderChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Prefer not to say</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non-binary">Non-binary</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="region" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Region
              </label>
              <select
                id="region"
                value={demographics.region || ''}
                onChange={handleRegionChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Prefer not to say</option>
                <option value="North America">North America</option>
                <option value="Europe">Europe</option>
                <option value="Asia">Asia</option>
                <option value="South America">South America</option>
                <option value="Africa">Africa</option>
                <option value="Australia">Australia</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="occupation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Occupation
              </label>
              <select
                id="occupation"
                value={demographics.occupation || ''}
                onChange={handleOccupationChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Prefer not to say</option>
                <option value="Technology">Technology</option>
                <option value="Education">Education</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Finance">Finance</option>
                <option value="Retail">Retail</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
          
          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            Note: Your demographic information is stored securely and is never displayed publicly in an identifiable way.
            Poll results will only show demographic breakdowns when there are at least 20 people in a given group to 
            ensure privacy and anonymity.
          </p>
        </form>
      )}
    </div>
  );
};

export default DemographicForm;