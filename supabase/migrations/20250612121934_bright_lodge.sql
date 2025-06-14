/*
  # Add RPC function to find similar polls

  1. RPC Function
    - get_similar_polls: Find polls with similar questions using full-text search
    - Excludes polls created by the current user
    - Returns up to 5 most relevant active polls
    - Uses PostgreSQL's full-text search capabilities
*/

CREATE OR REPLACE FUNCTION get_similar_polls(
  search_term text,
  current_user_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  question text,
  description text,
  type text,
  response_count integer,
  category text,
  similarity_rank real
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.question,
    p.description,
    p.type,
    p.response_count,
    p.category,
    ts_rank(
      to_tsvector('english', p.question || ' ' || COALESCE(p.description, '')),
      plainto_tsquery('english', search_term)
    ) as similarity_rank
  FROM polls p
  WHERE 
    p.is_active = true
    AND (current_user_id IS NULL OR p.creator_id != current_user_id)
    AND to_tsvector('english', p.question || ' ' || COALESCE(p.description, '')) 
        @@ plainto_tsquery('english', search_term)
  ORDER BY similarity_rank DESC
  LIMIT 5;
END;
$$;