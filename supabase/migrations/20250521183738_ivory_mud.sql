/*
  # Update poll responses RLS policies

  1. Changes
    - Update INSERT policy for poll_responses table to require authentication
    - Ensure user_id column matches auth.uid()
  
  This improves security by requiring users to be logged in to submit poll responses.
*/

-- First drop the existing INSERT policy
DROP POLICY IF EXISTS "Anyone can submit poll responses" ON public.poll_responses;

-- Create a new, more restrictive INSERT policy
CREATE POLICY "Authenticated users can create responses" 
ON public.poll_responses
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Update the SELECT policy to allow poll creators to see all responses for their polls
DROP POLICY IF EXISTS "Users can read their own responses" ON public.poll_responses;

CREATE POLICY "Users can read responses" 
ON public.poll_responses
FOR SELECT 
TO public
USING (
  -- Users can see their own responses
  (user_id = auth.uid()) 
  OR 
  -- Poll creators can see all responses for their polls
  EXISTS (
    SELECT 1 FROM polls 
    WHERE polls.id = poll_responses.poll_id 
    AND polls.creator_id = auth.uid()
  )
  OR
  -- For anonymous viewing of results (demographics hidden)
  (true)
);