import React, { useState } from 'react';
import { Filter, XCircle } from 'lucide-react';
import { FilterOptions, AgeRange, Gender } from '../types';

interface FilterPanelProps {
  onFilterChange: (filters: FilterOptions) => void;
  activeFilters: FilterOptions;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ onFilterChange, activeFilters }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const ageRanges: AgeRange[] = ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'];
  const genders: Gender[] = ['male', 'female', 'non-binary', 'prefer-not-to-say'];
  const regions = ['North America', 'Europe', 'Asia', 'South America', 'Africa', 'Australia'];
  const occupations = ['Technology', 'Education', 'Healthcare', 'Finance', 'Retail', 'Other'];
  
  const handleAgeChange = (age: AgeRange | undefined) => {
    onFilterChange({ ...activeFilters, ageRange: age });
  };
  
  const handleGenderChange = (gender: Gender | undefined) => {
    onFilterChange({ ...activeFilters, gender });
  };
  
  const handleRegionChange = (region: string | undefined) => {
    onFilterChange({ ...activeFilters, region });
  };
  
  const handleOccupationChange = (occupation: string | undefined) => {
    onFilterChange({ ...activeFilters, occupation });
  };
  
  const clearAllFilters = () => {
    onFilterChange({});
  };
  
  const activeFilterCount = Object.values(activeFilters).filter(Boolean).length;
  
  return (
    <div className="mb-6">
      {/* Demographic Filters */}
      <div className="bg-white dark:bg-dark-800/50 backdrop-blur border border-gray-200 dark:border-dark-700/50 rounded-xl">
        <div 
          className="p-3 flex justify-between items-center cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center">
            <Filter size={16} className="mr-2 text-blue-500" />
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Demographic Filters</h3>
            {activeFilterCount > 0 && (
              <span className="ml-2 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 text-xs font-semibold px-2 py-0.5 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </div>
          <div>
            {isExpanded ? (
              <XCircle size={16} className="text-gray-400 dark:text-dark-300" />
            ) : (
              <svg className="w-4 h-4 text-gray-400 dark:text-dark-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </div>
        </div>
        
        {isExpanded && (
          <div className="p-3 border-t border-gray-200 dark:border-dark-700/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Age Range Filter */}
              <div>
                <h4 className="text-xs font-medium text-gray-900 dark:text-white mb-2">Age Range</h4>
                <div className="flex flex-wrap gap-1">
                  {ageRanges.map(age => (
                    <button
                      key={age}
                      onClick={() => handleAgeChange(activeFilters.ageRange === age ? undefined : age)}
                      className={`px-2 py-0.5 text-xs rounded-full ${
                        activeFilters.ageRange === age
                          ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300'
                          : 'bg-gray-100 dark:bg-dark-800/50 text-gray-600 dark:text-dark-300 hover:bg-gray-200 dark:hover:bg-dark-700/50'
                      }`}
                    >
                      {age}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Gender Filter */}
              <div>
                <h4 className="text-xs font-medium text-gray-900 dark:text-white mb-2">Gender</h4>
                <div className="flex flex-wrap gap-1">
                  {genders.map(gender => (
                    <button
                      key={gender}
                      onClick={() => handleGenderChange(activeFilters.gender === gender ? undefined : gender)}
                      className={`px-2 py-0.5 text-xs rounded-full ${
                        activeFilters.gender === gender
                          ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300'
                          : 'bg-gray-100 dark:bg-dark-800/50 text-gray-600 dark:text-dark-300 hover:bg-gray-200 dark:hover:bg-dark-700/50'
                      }`}
                    >
                      {gender === 'prefer-not-to-say' ? 'Prefer not to say' : 
                        gender.charAt(0).toUpperCase() + gender.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Region Filter */}
              <div>
                <h4 className="text-xs font-medium text-gray-900 dark:text-white mb-2">Region</h4>
                <div className="flex flex-wrap gap-1">
                  {regions.map(region => (
                    <button
                      key={region}
                      onClick={() => handleRegionChange(activeFilters.region === region ? undefined : region)}
                      className={`px-2 py-0.5 text-xs rounded-full ${
                        activeFilters.region === region
                          ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300'
                          : 'bg-gray-100 dark:bg-dark-800/50 text-gray-600 dark:text-dark-300 hover:bg-gray-200 dark:hover:bg-dark-700/50'
                      }`}
                    >
                      {region}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Occupation Filter */}
              <div>
                <h4 className="text-xs font-medium text-gray-900 dark:text-white mb-2">Occupation</h4>
                <div className="flex flex-wrap gap-1">
                  {occupations.map(occupation => (
                    <button
                      key={occupation}
                      onClick={() => handleOccupationChange(activeFilters.occupation === occupation ? undefined : occupation)}
                      className={`px-2 py-0.5 text-xs rounded-full ${
                        activeFilters.occupation === occupation
                          ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300'
                          : 'bg-gray-100 dark:bg-dark-800/50 text-gray-600 dark:text-dark-300 hover:bg-gray-200 dark:hover:bg-dark-700/50'
                      }`}
                    >
                      {occupation}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {activeFilterCount > 0 && (
              <div className="mt-3 flex justify-end">
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-red-500 hover:text-red-400"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterPanel;