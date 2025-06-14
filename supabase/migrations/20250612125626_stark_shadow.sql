/*
  # Synchronize poll response counts with actual data

  1. Data Integrity Fix
    - Update response_count in polls table to match actual count from poll_responses table
    - This corrects any discrepancies from mock data or missed increments
    - Ensures frontend displays accurate response counts

  2. Performance
    - Single UPDATE operation with subquery for efficiency
    - Sets response_count to 0 for polls with no responses
*/

-- Update response_count to match actual responses in poll_responses table
UPDATE public.polls 
SET response_count = (
  SELECT COUNT(*)
  FROM public.poll_responses 
  WHERE poll_responses.poll_id = polls.id
);

-- Verify the update worked by showing polls with their updated counts
-- This is just for verification and doesn't affect the data
DO $$
DECLARE
  total_polls integer;
  polls_with_responses integer;
BEGIN
  SELECT COUNT(*) INTO total_polls FROM public.polls;
  SELECT COUNT(*) INTO polls_with_responses FROM public.polls WHERE response_count > 0;
  
  RAISE NOTICE 'Migration completed: Updated % polls, % have responses', total_polls, polls_with_responses;
END $$;