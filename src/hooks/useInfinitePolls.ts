import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchPolls, fetchAnsweredPolls, fetchTrendingPolls, fetchUnansweredPolls } from '../lib/supabase';
import { formatSupabasePolls } from '../utils/pollFormatters';

const PAGE_SIZE = 20;

export const useInfinitePolls = (
  category?: string,
  searchQuery?: string,
  pollType: 'all' | 'answered' | 'trending' = 'all',
  userId?: string
) => {
  return useInfiniteQuery({
    queryKey: ['polls', pollType, category, searchQuery, userId],
    queryFn: async ({ pageParam = 1 }) => {
      let response;
      
      switch (pollType) {
        case 'answered':
          if (!userId) throw new Error('User ID required for answered polls');
          response = await fetchAnsweredPolls(userId, category, searchQuery, pageParam, PAGE_SIZE);
          break;
        case 'trending':
          response = await fetchTrendingPolls(undefined, category, searchQuery, pageParam, PAGE_SIZE);
          break;
        default:
          response = await fetchPolls(category, searchQuery, pageParam, PAGE_SIZE);
          break;
      }
      
      return {
        polls: formatSupabasePolls(response.data),
        nextPage: response.hasMore ? pageParam + 1 : undefined,
        hasMore: response.hasMore
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAnswerPolls = (category?: string, searchQuery?: string, userId?: string) => {
  return useInfiniteQuery({
    queryKey: ['answer-polls', category, searchQuery, userId],
    queryFn: async ({ pageParam = 1 }) => {
      if (!userId) {
        // If no user is logged in, return empty results
        return {
          polls: [],
          nextPage: undefined,
          hasMore: false
        };
      }

      // Use the new fetchUnansweredPolls function for server-side filtering
      const response = await fetchUnansweredPolls(userId, category, searchQuery, pageParam, PAGE_SIZE);
      const formattedPolls = formatSupabasePolls(response.data);
      
      return {
        polls: formattedPolls,
        nextPage: response.hasMore ? pageParam + 1 : undefined,
        hasMore: response.hasMore
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!userId, // Only run the query if user is logged in
  });
};