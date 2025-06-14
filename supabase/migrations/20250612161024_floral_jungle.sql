/*
  # Bookmark RPC Functions

  1. RPC Functions
    - add_bookmark: Add a bookmark for a user
    - remove_bookmark: Remove a bookmark for a user
    - get_bookmarked_poll_ids: Get all bookmarked poll IDs for a user
    - is_poll_bookmarked: Check if a specific poll is bookmarked by a user

  2. Security
    - All functions respect RLS policies
    - Functions validate user authentication
*/

-- Function to add a bookmark
CREATE OR REPLACE FUNCTION add_bookmark(p_user_id uuid, p_poll_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is authenticated and matches the provided user_id
  IF auth.uid() IS NULL OR auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: User must be authenticated and match the provided user_id';
  END IF;

  -- Insert bookmark (ON CONFLICT DO NOTHING prevents duplicates)
  INSERT INTO public.user_bookmarks (user_id, poll_id)
  VALUES (p_user_id, p_poll_id)
  ON CONFLICT (user_id, poll_id) DO NOTHING;
END;
$$;

-- Function to remove a bookmark
CREATE OR REPLACE FUNCTION remove_bookmark(p_user_id uuid, p_poll_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is authenticated and matches the provided user_id
  IF auth.uid() IS NULL OR auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: User must be authenticated and match the provided user_id';
  END IF;

  -- Delete bookmark
  DELETE FROM public.user_bookmarks
  WHERE user_id = p_user_id AND poll_id = p_poll_id;
END;
$$;

-- Function to get all bookmarked poll IDs for a user
CREATE OR REPLACE FUNCTION get_bookmarked_poll_ids(p_user_id uuid)
RETURNS uuid[]
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  poll_ids uuid[];
BEGIN
  -- Check if user is authenticated and matches the provided user_id
  IF auth.uid() IS NULL OR auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: User must be authenticated and match the provided user_id';
  END IF;

  -- Get all bookmarked poll IDs
  SELECT ARRAY_AGG(poll_id ORDER BY created_at DESC)
  INTO poll_ids
  FROM public.user_bookmarks
  WHERE user_id = p_user_id;

  -- Return empty array if no bookmarks found
  RETURN COALESCE(poll_ids, ARRAY[]::uuid[]);
END;
$$;

-- Function to check if a specific poll is bookmarked by a user
CREATE OR REPLACE FUNCTION is_poll_bookmarked(p_user_id uuid, p_poll_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_bookmarked boolean;
BEGIN
  -- Check if user is authenticated and matches the provided user_id
  IF auth.uid() IS NULL OR auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: User must be authenticated and match the provided user_id';
  END IF;

  -- Check if bookmark exists
  SELECT EXISTS(
    SELECT 1 FROM public.user_bookmarks
    WHERE user_id = p_user_id AND poll_id = p_poll_id
  ) INTO is_bookmarked;

  RETURN is_bookmarked;
END;
$$;