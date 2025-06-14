/*
  # Add unique constraint to poll_responses table
  
  1. Remove Duplicates
    - Find and remove duplicate poll responses from the same user for the same poll
    - Keep only the most recent response (latest created_at) for each user-poll combination
  
  2. Add Unique Constraint
    - Add unique constraint on (poll_id, user_id) to prevent future duplicates
*/

-- First, remove duplicate responses (keep only the most recent one for each user-poll combination)
WITH duplicate_responses AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (
      PARTITION BY poll_id, user_id 
      ORDER BY created_at DESC
    ) as row_num
  FROM public.poll_responses
)
DELETE FROM public.poll_responses 
WHERE id IN (
  SELECT id 
  FROM duplicate_responses 
  WHERE row_num > 1
);

-- Now add the unique constraint to prevent future duplicates
ALTER TABLE public.poll_responses 
ADD CONSTRAINT poll_responses_user_poll_unique 
UNIQUE (poll_id, user_id);