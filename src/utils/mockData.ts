import { Poll, PollResponse, PollStats, User, AgeRange, Gender } from '../types';

// Generate a random date within the last 30 days
const getRandomDate = () => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  return new Date(
    thirtyDaysAgo.getTime() + Math.random() * (now.getTime() - thirtyDaysAgo.getTime())
  );
};

// Generate a random age range
const getRandomAgeRange = (): AgeRange => {
  const ranges: AgeRange[] = ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'];
  return ranges[Math.floor(Math.random() * ranges.length)];
};

// Generate a random gender
const getRandomGender = (): Gender => {
  const genders: Gender[] = ['male', 'female', 'non-binary', 'prefer-not-to-say'];
  return genders[Math.floor(Math.random() * genders.length)];
};

// Generate random users with demographics
export const generateMockUsers = (count: number): User[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `user-${i}`,
    demographics: {
      ageRange: getRandomAgeRange(),
      gender: getRandomGender(),
      region: ['North America', 'Europe', 'Asia', 'South America', 'Africa', 'Australia'][
        Math.floor(Math.random() * 6)
      ],
      occupation: ['Technology', 'Education', 'Healthcare', 'Finance', 'Retail', 'Other'][
        Math.floor(Math.random() * 6)
      ],
    },
    createdAt: getRandomDate(),
  }));
};

// Sample polls covering different poll types
export const mockPolls: Poll[] = [
  {
    id: 'poll-1',
    creatorId: 'user-5',
    question: 'Do you consider yourself bald?',
    description: 'Answer based on your current hair status.',
    type: 'boolean',
    createdAt: getRandomDate(),
    upvotes: 245,
    responseCount: 1852,
    isActive: true,
    demographicFilters: ['gender', 'ageRange'],
  },
  {
    id: 'poll-2',
    creatorId: 'user-12',
    question: 'How many hours of TV do you watch per week?',
    description: 'Include streaming services like Netflix, Hulu, etc.',
    type: 'numeric',
    createdAt: getRandomDate(),
    upvotes: 189,
    responseCount: 1243,
    isActive: true,
    minValue: 0,
    maxValue: 100,
    demographicFilters: ['ageRange', 'region'],
  },
  {
    id: 'poll-3',
    creatorId: 'user-8',
    question: 'How satisfied are you with your current job?',
    description: 'Rate on a scale from 1 (very dissatisfied) to 100 (very satisfied).',
    type: 'slider',
    createdAt: getRandomDate(),
    upvotes: 312,
    responseCount: 2541,
    isActive: true,
    minValue: 1,
    maxValue: 100,
    demographicFilters: ['occupation', 'ageRange', 'gender'],
  },
  {
    id: 'poll-4',
    creatorId: 'user-3',
    question: 'Which social media platform do you use most frequently?',
    type: 'choice',
    createdAt: getRandomDate(),
    upvotes: 278,
    responseCount: 3105,
    isActive: true,
    options: [
      { id: 'option-1', text: 'Facebook' },
      { id: 'option-2', text: 'Instagram' },
      { id: 'option-3', text: 'Twitter/X' },
      { id: 'option-4', text: 'TikTok' },
      { id: 'option-5', text: 'LinkedIn' },
      { id: 'option-6', text: 'Reddit' },
      { id: 'option-7', text: 'Other' },
    ],
    demographicFilters: ['ageRange', 'gender', 'region'],
  },
  {
    id: 'poll-5',
    creatorId: 'user-15',
    question: 'Have you ever owned cryptocurrency?',
    type: 'boolean',
    createdAt: getRandomDate(),
    upvotes: 167,
    responseCount: 1894,
    isActive: true,
    demographicFilters: ['ageRange', 'occupation'],
  },
  {
    id: 'poll-6',
    creatorId: 'user-7',
    question: 'How many countries have you visited?',
    type: 'numeric',
    createdAt: getRandomDate(),
    upvotes: 203,
    responseCount: 1721,
    isActive: true,
    minValue: 0,
    maxValue: 200,
    demographicFilters: ['ageRange', 'region'],
  },
];

// Generate mock poll stats
export const generateMockStats = (pollId: string): PollStats => {
  const poll = mockPolls.find(p => p.id === pollId);
  
  if (!poll) {
    return {
      count: 0,
      distribution: {
        labels: [],
        values: []
      }
    };
  }
  
  switch (poll.type) {
    case 'boolean':
      return {
        count: poll.responseCount,
        distribution: {
          labels: ['Yes', 'No'],
          values: [
            Math.floor(Math.random() * poll.responseCount),
            Math.floor(Math.random() * poll.responseCount),
          ]
        }
      };
      
    case 'numeric':
    case 'slider':
      const min = poll.minValue || 0;
      const max = poll.maxValue || 100;
      const range = max - min;
      const buckets = 10;
      const bucketSize = range / buckets;
      
      const labels = Array.from({ length: buckets }, (_, i) => 
        `${Math.round(min + i * bucketSize)}-${Math.round(min + (i + 1) * bucketSize - 1)}`
      );
      
      const values = Array.from({ length: buckets }, () => 
        Math.floor(Math.random() * (poll.responseCount / buckets * 2))
      );
      
      const total = values.reduce((sum, val) => sum + val, 0);
      const normalizedValues = values.map(v => Math.floor(v * (poll.responseCount / total)));
      
      const mean = min + (Math.random() * range);
      const median = min + (Math.random() * range);
      const mode = labels[values.indexOf(Math.max(...values))];
      
      return {
        mean,
        median,
        mode,
        count: poll.responseCount,
        distribution: {
          labels,
          values: normalizedValues
        }
      };
      
    case 'choice':
      if (!poll.options) return { count: 0, distribution: { labels: [], values: [] }};
      
      const optionLabels = poll.options.map(o => o.text);
      const optionValues = Array.from({ length: optionLabels.length }, () => 
        Math.floor(Math.random() * (poll.responseCount / optionLabels.length * 2))
      );
      
      const optionsTotal = optionValues.reduce((sum, val) => sum + val, 0);
      const normalizedOptionValues = optionValues.map(v => 
        Math.floor(v * (poll.responseCount / optionsTotal))
      );
      
      return {
        mode: optionLabels[optionValues.indexOf(Math.max(...optionValues))],
        count: poll.responseCount,
        distribution: {
          labels: optionLabels,
          values: normalizedOptionValues
        }
      };
      
    default:
      return {
        count: 0,
        distribution: {
          labels: [],
          values: []
        }
      };
  }
};

// Generate filtered stats based on demographic filters
export const generateFilteredStats = (
  pollId: string, 
  filters: { ageRange?: string; gender?: string; region?: string; occupation?: string }
): PollStats => {
  // Start with the base stats
  const baseStats = generateMockStats(pollId);
  
  // Adjust the count and distribution based on filters
  // This is a simple mock implementation that reduces the count by a percentage for each filter
  const filterReductionFactor = 0.7; // Each filter reduces the sample by 30%
  const filterCount = Object.values(filters).filter(Boolean).length;
  const filteredCount = Math.floor(baseStats.count * Math.pow(filterReductionFactor, filterCount));
  
  // If we filter too much, return "not enough data"
  if (filteredCount < 20) {
    return {
      count: filteredCount,
      distribution: {
        labels: [],
        values: []
      }
    };
  }
  
  // Adjust the distribution values
  const adjustmentFactor = filteredCount / baseStats.count;
  const filteredValues = baseStats.distribution.values.map(v => 
    Math.floor(v * adjustmentFactor)
  );
  
  return {
    ...baseStats,
    count: filteredCount,
    distribution: {
      labels: baseStats.distribution.labels,
      values: filteredValues
    }
  };
};