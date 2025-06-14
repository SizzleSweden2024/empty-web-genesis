export type User = {
  id: string;
  demographics?: UserDemographics;
  createdAt: Date;
};

export type UserDemographics = {
  ageRange?: AgeRange;
  gender?: Gender;
  region?: string;
  occupation?: string;
};

export type AgeRange = 
  | '18-24'
  | '25-34'
  | '35-44'
  | '45-54'
  | '55-64'
  | '65+';

export type Gender = 
  | 'male'
  | 'female'
  | 'non-binary'
  | 'prefer-not-to-say';

export type PollType = 
  | 'boolean'  // Yes/No
  | 'slider'   // 1-100 
  | 'numeric'  // Custom numeric input
  | 'choice';  // Multiple choice

export type PollCategory = 
  | 'All'
  | 'Life'
  | 'Work'
  | 'Entertainment'
  | 'Finance'
  | 'Health'
  | 'Relationships'
  | 'Technology'
  | 'Sports';

export type Poll = {
  id: string;
  creatorId: string;
  question: string;
  description?: string;
  type: PollType;
  category?: string;
  createdAt: Date;
  upvotes: number;
  responseCount: number;
  isActive: boolean;
  options?: PollOption[]; // For choice type
  minValue?: number;      // For slider & numeric
  maxValue?: number;      // For slider & numeric
  demographicFilters: string[]; // Which demographics to collect
};

export type PollOption = {
  id: string;
  text: string;
};

export type PollResponse = {
  id: string;
  pollId: string;
  userId: string;
  value: number | boolean | string;
  createdAt: Date;
};

export type FilterOptions = {
  ageRange?: AgeRange;
  gender?: Gender;
  region?: string;
  occupation?: string;
  category?: string;
  search?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
};

export type PollStats = {
  mean?: number;
  median?: number;
  mode?: number | boolean | string;
  count: number;
  distribution: Distribution;
};

export type Distribution = {
  labels: (string | number)[];
  values: number[];
};