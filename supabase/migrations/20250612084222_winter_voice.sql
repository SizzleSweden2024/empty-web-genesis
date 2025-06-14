/*
  # Add performance indexes for common query patterns

  1. Indexes for Frequently Queried Columns
    - polls.category for filtering by category
    - polls.response_count for ordering trending polls
    - poll_responses.age_range, gender, region, occupation for demographic filtering
    - Composite indexes for common filter combinations

  2. Optimization Notes
    - These indexes will speed up WHERE clauses, ORDER BY operations, and filtering
    - Composite indexes are ordered by selectivity (most selective first)
    - Existing indexes on polls.created_at and poll_responses.poll_id remain
*/

-- Index for category filtering (if not already exists)
CREATE INDEX IF NOT EXISTS idx_polls_category 
ON public.polls (category);

-- Index for trending polls ordering
CREATE INDEX IF NOT EXISTS idx_polls_response_count_desc 
ON public.polls (response_count DESC, created_at DESC);

-- Index for active polls filtering with response count ordering
CREATE INDEX IF NOT EXISTS idx_polls_active_trending 
ON public.polls (is_active, response_count DESC, created_at DESC);

-- Composite index for category + active filtering
CREATE INDEX IF NOT EXISTS idx_polls_category_active 
ON public.polls (category, is_active, created_at DESC);

-- Demographic filtering indexes for poll_responses
CREATE INDEX IF NOT EXISTS idx_poll_responses_age_range 
ON public.poll_responses (age_range);

CREATE INDEX IF NOT EXISTS idx_poll_responses_gender 
ON public.poll_responses (gender);

CREATE INDEX IF NOT EXISTS idx_poll_responses_region 
ON public.poll_responses (region);

CREATE INDEX IF NOT EXISTS idx_poll_responses_occupation 
ON public.poll_responses (occupation);

-- Composite index for poll stats with demographics
CREATE INDEX IF NOT EXISTS idx_poll_responses_stats 
ON public.poll_responses (poll_id, age_range, gender, region, occupation);

-- Index for recent responses (used in insights)
CREATE INDEX IF NOT EXISTS idx_poll_responses_recent 
ON public.poll_responses (created_at DESC, poll_id);

-- Text search index for polls (if using full-text search in the future)
CREATE INDEX IF NOT EXISTS idx_polls_text_search 
ON public.polls USING gin(to_tsvector('english', question || ' ' || COALESCE(description, '')));

-- Optimize polls with options query
CREATE INDEX IF NOT EXISTS idx_poll_options_poll_id_text 
ON public.poll_options (poll_id, text);

-- Index for user response checking
CREATE INDEX IF NOT EXISTS idx_poll_responses_user_poll 
ON public.poll_responses (user_id, poll_id);