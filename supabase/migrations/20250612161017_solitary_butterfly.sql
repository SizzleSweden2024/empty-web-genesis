/*
  # Create user_bookmarks table for authenticated users

  1. New Table
    - `user_bookmarks` table to store user bookmarks
    - Links users to polls they've bookmarked
    - Prevents duplicate bookmarks with unique constraint

  2. Security
    - Enable RLS on user_bookmarks table
    - Users can only manage their own bookmarks
    - Policies for SELECT, INSERT, and DELETE operations
*/

-- Create user_bookmarks table
CREATE TABLE public.user_bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  poll_id uuid REFERENCES public.polls(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  
  UNIQUE (user_id, poll_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_bookmarks ENABLE ROW LEVEL SECURITY;

-- RLS Policy for SELECT: Allow authenticated users to view their own bookmarks
CREATE POLICY "Allow authenticated users to view their own bookmarks"
ON public.user_bookmarks
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- RLS Policy for INSERT: Allow authenticated users to insert their own bookmarks
CREATE POLICY "Allow authenticated users to insert their own bookmarks"
ON public.user_bookmarks
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- RLS Policy for DELETE: Allow authenticated users to delete their own bookmarks
CREATE POLICY "Allow authenticated users to delete their own bookmarks"
ON public.user_bookmarks
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Create index for better query performance
CREATE INDEX idx_user_bookmarks_user_id ON public.user_bookmarks (user_id);
CREATE INDEX idx_user_bookmarks_poll_id ON public.user_bookmarks (poll_id);