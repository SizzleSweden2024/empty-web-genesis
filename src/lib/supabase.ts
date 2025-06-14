import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/index';
import { PollStats } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export const fetchPolls = async (
  category?: string, 
  searchQuery?: string, 
  page = 1, 
  pageSize = 20
) => {
  let query = supabase
    .from('polls')
    .select(`
      id,
      created_at,
      creator_id,
      question,
      description,
      type,
      category,
      min_value,
      max_value,
      upvotes,
      response_count,
      is_active,
      demographic_filters,
      poll_options (
        id,
        poll_id,
        text,
        created_at
      )
    `)
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  // Apply category filter
  if (category && category !== 'All') {
    query = query.eq('category', category);
  }

  // Apply search filter
  if (searchQuery?.trim()) {
    query = query.or(`question.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
  }

  const { data, error, count } = await query;

  if (error) throw error;
  
  return {
    data: data.map(poll => ({
      ...poll,
      options: poll.poll_options
    })),
    count: count || 0,
    hasMore: data.length === pageSize
  };
};

export const fetchUnansweredPolls = async (
  userId: string,
  category?: string, 
  searchQuery?: string, 
  page = 1, 
  pageSize = 20
) => {
  let query = supabase
    .from('polls')
    .select(`
      id,
      created_at,
      creator_id,
      question,
      description,
      type,
      category,
      min_value,
      max_value,
      upvotes,
      response_count,
      is_active,
      demographic_filters,
      poll_options (
        id,
        poll_id,
        text,
        created_at
      )
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  // Apply category filter
  if (category && category !== 'All') {
    query = query.eq('category', category);
  }

  // Apply search filter
  if (searchQuery?.trim()) {
    query = query.or(`question.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
  }

  const { data: polls, error } = await query;

  if (error) throw error;

  // Get all poll IDs that the user has already answered
  const { data: answeredPollIds, error: responseError } = await supabase
    .from('poll_responses')
    .select('poll_id')
    .eq('user_id', userId);

  if (responseError) throw responseError;

  const answeredIds = new Set(answeredPollIds.map(response => response.poll_id));

  // Filter out polls the user has already answered
  const unansweredPolls = polls.filter(poll => !answeredIds.has(poll.id));

  return {
    data: unansweredPolls.map(poll => ({
      ...poll,
      options: poll.poll_options
    })),
    count: unansweredPolls.length,
    hasMore: unansweredPolls.length === pageSize
  };
};

export const fetchPollById = async (id: string) => {
  const { data, error } = await supabase
    .from('polls')
    .select(`
      id,
      created_at,
      creator_id,
      question,
      description,
      type,
      category,
      min_value,
      max_value,
      upvotes,
      response_count,
      is_active,
      demographic_filters,
      poll_options (
        id,
        poll_id,
        text,
        created_at
      )
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  
  return {
    ...data,
    options: data.poll_options
  };
};

export const fetchAnsweredPolls = async (
  userId: string, 
  category?: string, 
  searchQuery?: string,
  page = 1,
  pageSize = 20
) => {
  // First, build the base query for polls with user responses
  let query = supabase
    .from('polls')
    .select(`
      id,
      created_at,
      creator_id,
      question,
      description,
      type,
      category,
      min_value,
      max_value,
      upvotes,
      response_count,
      is_active,
      demographic_filters,
      poll_options (
        id,
        poll_id,
        text,
        created_at
      ),
      poll_responses!inner (
        user_id
      )
    `)
    .eq('poll_responses.user_id', userId)
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  // Apply category filter
  if (category && category !== 'All') {
    query = query.eq('category', category);
  }

  // Apply search filter
  if (searchQuery?.trim()) {
    query = query.or(`question.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
  }

  const { data, error, count } = await query;

  if (error) throw error;
  
  return {
    data: data.map(poll => ({
      ...poll,
      options: poll.poll_options
    })),
    count: count || 0,
    hasMore: data.length === pageSize
  };
};

export const hasUserRespondedToPoll = async (userId: string, pollId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('poll_responses')
    .select('id')
    .eq('user_id', userId)
    .eq('poll_id', pollId)
    .limit(1);

  if (error) {
    console.error('Error checking user response:', error);
    return false;
  }

  return data && data.length > 0;
};

export const fetchTrendingPolls = async (
  limit?: number, 
  category?: string, 
  searchQuery?: string,
  page = 1,
  pageSize = 20
) => {
  let query = supabase
    .from('polls')
    .select(`
      id,
      created_at,
      creator_id,
      question,
      description,
      type,
      category,
      min_value,
      max_value,
      upvotes,
      response_count,
      is_active,
      demographic_filters,
      poll_options (
        id,
        poll_id,
        text,
        created_at
      )
    `)
    .eq('is_active', true)
    .order('response_count', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  // Apply category filter
  if (category && category !== 'All') {
    query = query.eq('category', category);
  }

  // Apply search filter
  if (searchQuery?.trim()) {
    query = query.or(`question.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
  }

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error, count } = await query;

  if (error) throw error;
  
  return {
    data: data.map(poll => ({
      ...poll,
      options: poll.poll_options
    })),
    count: count || 0,
    hasMore: data.length === pageSize
  };
};

export const fetchSimilarPolls = async (question: string, userId?: string) => {
  const { data, error } = await supabase.rpc('get_similar_polls', {
    search_term: question,
    current_user_id: userId || null
  });

  if (error) {
    console.error('Error fetching similar polls:', error);
    return [];
  }

  return data || [];
};

export const createPollResponse = async (
  pollId: string,
  userId: string,
  value: any,
  demographics: Record<string, string> = {}
) => {
  // Get user demographics from profile
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('age_range, gender, region, occupation')
    .eq('id', userId)
    .maybeSingle();
    
  if (profileError) {
    throw profileError;
  }

  try {
    // First, insert the response
    const { error: responseError } = await supabase
      .from('poll_responses')
      .insert([{
        poll_id: pollId,
        user_id: userId,
        value,
        age_range: profileData?.age_range || null,
        gender: profileData?.gender || null,
        region: profileData?.region || null,
        occupation: profileData?.occupation || null
      }]);

    if (responseError) {
      // Check if it's a unique constraint violation (duplicate response)
      if (responseError.code === '23505') {
        throw new Error('You have already responded to this poll.');
      }
      throw responseError;
    }

    // Update the response_count using RPC function
    const { error: updateError } = await supabase.rpc('increment_response_count', {
      poll_id: pollId
    });
    
    if (updateError) throw updateError;
  } catch (error) {
    // Re-throw with proper error handling
    throw error;
  }
};

export const getTodaysInsights = async () => {
  try {
    // Use the database function to get all insights
    const { data, error } = await supabase.rpc('get_all_insights');
    
    if (error) throw error;
    
    return data.insights || [];
  } catch (error) {
    console.error('Error fetching insights:', error);
    
    // Return default insights on error
    return [
      {
        value: '73%',
        question: 'of developers use dark mode in their IDE',
        color: 'blue'
      },
      {
        value: '6.2',
        question: 'hours of sleep on average for software engineers',
        color: 'purple'
      },
      {
        value: '42%',
        question: 'of people in their 40s report being bald or balding',
        color: 'orange'
      },
      {
        value: '4.8',
        question: 'hours per day spent on social media',
        color: 'pink'
      },
      {
        value: '67%',
        question: 'prefer working remotely over office work',
        color: 'yellow'
      },
      {
        value: '85%',
        question: 'of professionals check email outside work hours',
        color: 'green'
      }
    ];
  }
};

export const getPollStats = async (
  pollId: string, 
  filters: {
    ageRange?: string; 
    gender?: string; 
    region?: string; 
    occupation?: string;
  } = {}
): Promise<PollStats> => {
  // First, fetch the poll details to get its type and configuration
  const { data: pollData, error: pollError } = await supabase
    .from('polls')
    .select(`
      id,
      type,
      min_value,
      max_value,
      poll_options (
        id,
        text
      )
    `)
    .eq('id', pollId)
    .single();

  if (pollError) throw pollError;

  let query = supabase
    .from('poll_responses')
    .select('value, age_range, gender, region, occupation')
    .eq('poll_id', pollId);

  // Apply demographic filters if provided
  if (filters.ageRange) {
    query = query.eq('age_range', filters.ageRange);
  }
  if (filters.gender) {
    query = query.eq('gender', filters.gender);
  }
  if (filters.region) {
    query = query.eq('region', filters.region);
  }
  if (filters.occupation) {
    query = query.eq('occupation', filters.occupation);
  }

  const { data: responses, error } = await query;

  if (error) throw error;

  // Process responses into stats
  const values = responses?.map(r => r.value) || [];
  const count = responses?.length || 0;

  // If no responses, return empty stats
  if (count === 0) {
    return {
      count: 0,
      distribution: { labels: [], values: [] }
    };
  }

  // Process based on poll type
  switch (pollData.type) {
    case 'boolean': {
      // Count true/false responses, handling both boolean and string values
      let trueCount = 0;
      let falseCount = 0;
      
      values.forEach(value => {
        // Handle different possible formats: boolean, string "true"/"false", or string true/false
        if (value === true || value === 'true' || (typeof value === 'string' && value.toLowerCase() === 'true')) {
          trueCount++;
        } else if (value === false || value === 'false' || (typeof value === 'string' && value.toLowerCase() === 'false')) {
          falseCount++;
        }
      });

      return {
        count,
        distribution: {
          labels: ['Yes', 'No'],
          values: [trueCount, falseCount]
        }
      };
    }

    case 'numeric':
    case 'slider': {
      // Convert all values to numbers
      const numericValues = values
        .map(v => typeof v === 'number' ? v : Number(v))
        .filter(v => !isNaN(v));

      if (numericValues.length === 0) {
        return {
          count: 0,
          distribution: { labels: [], values: [] }
        };
      }

      const sortedValues = [...numericValues].sort((a, b) => a - b);
      const mean = numericValues.reduce((sum, v) => sum + v, 0) / numericValues.length;
      const median = sortedValues[Math.floor(numericValues.length / 2)];
      
      // Use poll's min/max values if available, otherwise calculate from data
      const min = pollData.min_value !== null ? pollData.min_value : Math.min(...numericValues);
      const max = pollData.max_value !== null ? pollData.max_value : Math.max(...numericValues);
      
      // Create distribution buckets
      const bucketCount = Math.min(10, Math.max(5, Math.ceil(Math.sqrt(numericValues.length))));
      const bucketSize = (max - min) / bucketCount || 1; // Avoid division by zero
      
      const buckets = Array(bucketCount).fill(0);
      numericValues.forEach(v => {
        const bucketIndex = Math.min(
          Math.floor((v - min) / bucketSize),
          bucketCount - 1
        );
        buckets[bucketIndex]++;
      });

      const labels = Array.from({ length: bucketCount }, (_, i) => {
        const start = min + i * bucketSize;
        const end = min + (i + 1) * bucketSize;
        return `${start.toFixed(1)}-${end.toFixed(1)}`;
      });

      return {
        mean,
        median,
        count,
        distribution: {
          labels,
          values: buckets
        }
      };
    }

    case 'choice': {
      // For choice polls, values should be option IDs or text
      const valueCounts: Record<string, number> = {};
      
      values.forEach(value => {
        const valueStr = typeof value === 'string' ? value : String(value);
        // Remove quotes if the value is a quoted string
        const cleanValue = valueStr.replace(/^["']|["']$/g, '');
        valueCounts[cleanValue] = (valueCounts[cleanValue] || 0) + 1;
      });

      // Create option ID to text mapping
      const optionMap = new Map();
      if (pollData.poll_options) {
        pollData.poll_options.forEach((option: any) => {
          optionMap.set(option.id, option.text);
        });
      }

      // Convert option IDs to text where possible, keep original text otherwise
      const labels = Object.keys(valueCounts).map(key => 
        optionMap.get(key) || key
      );
      const choiceValues = Object.values(valueCounts);

      // Find the mode (most frequent choice)
      const maxCount = Math.max(...choiceValues);
      const modeIndex = choiceValues.indexOf(maxCount);
      const mode = labels[modeIndex];

      return {
        count,
        mode,
        distribution: { 
          labels, 
          values: choiceValues 
        }
      };
    }

    default: {
      // Fallback for unknown poll types
      return {
        count,
        distribution: { labels: [], values: [] }
      };
    }
  }
};

export const upvotePoll = async (pollId: string) => {
  const { error } = await supabase.rpc('increment_upvotes', {
    poll_id: pollId
  });
  
  if (error) throw error;
};

// ============ BOOKMARK FUNCTIONS ============

/**
 * Add a bookmark for the authenticated user
 */
export const addBookmark = async (userId: string, pollId: string): Promise<void> => {
  const { error } = await supabase.rpc('add_bookmark', {
    p_user_id: userId,
    p_poll_id: pollId
  });

  if (error) throw error;
};

/**
 * Remove a bookmark for the authenticated user
 */
export const removeBookmark = async (userId: string, pollId: string): Promise<void> => {
  const { error } = await supabase.rpc('remove_bookmark', {
    p_user_id: userId,
    p_poll_id: pollId
  });

  if (error) throw error;
};

/**
 * Get all bookmarked poll IDs for the authenticated user
 */
export const fetchBookmarkedPollIds = async (userId: string): Promise<string[]> => {
  const { data, error } = await supabase.rpc('get_bookmarked_poll_ids', {
    p_user_id: userId
  });

  if (error) throw error;

  return data || [];
};

/**
 * Check if a specific poll is bookmarked by the authenticated user
 */
export const isPollBookmarked = async (userId: string, pollId: string): Promise<boolean> => {
  const { data, error } = await supabase.rpc('is_poll_bookmarked', {
    p_user_id: userId,
    p_poll_id: pollId
  });

  if (error) throw error;

  return data || false;
};