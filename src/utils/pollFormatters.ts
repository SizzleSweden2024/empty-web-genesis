import { Poll, PollType } from '../types';

/**
 * Formats a raw poll object from Supabase into the frontend Poll type
 */
export const formatSupabasePoll = (rawPoll: any): Poll => {
  return {
    id: rawPoll.id,
    creatorId: rawPoll.creator_id,
    question: rawPoll.question,
    description: rawPoll.description || undefined,
    type: rawPoll.type as PollType,
    createdAt: new Date(rawPoll.created_at),
    upvotes: rawPoll.upvotes,
    responseCount: rawPoll.response_count, // Use the column directly
    isActive: rawPoll.is_active,
    options: rawPoll.poll_options?.map((opt: any) => ({
      id: opt.id,
      text: opt.text
    })) || rawPoll.options?.map((opt: any) => ({
      id: opt.id,
      text: opt.text
    })),
    minValue: rawPoll.min_value || undefined,
    maxValue: rawPoll.max_value || undefined,
    demographicFilters: rawPoll.demographic_filters || [],
    category: rawPoll.category || undefined
  };
};

/**
 * Formats multiple raw polls from Supabase
 */
export const formatSupabasePolls = (rawPolls: any[]): Poll[] => {
  return rawPolls.map(formatSupabasePoll);
};