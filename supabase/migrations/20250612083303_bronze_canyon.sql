/*
  # Performance Optimization Functions
  
  1. RPC Functions
    - increment_upvotes: Safely increment poll upvotes
    - increment_response_count: Safely increment poll response count
    
  2. Insight Functions
    - get_js_preference_insight: Get JavaScript preference percentage
    - get_avg_sleep_insight: Get average sleep hours
    - get_work_life_balance_insight: Get work-life balance satisfaction
    - get_remote_work_preference_insight: Get remote work preference percentage
    - get_avg_coding_hours_insight: Get average coding hours per day
    - get_young_professionals_insight: Get percentage of young professionals
*/

-- RPC Functions for atomic updates
CREATE OR REPLACE FUNCTION increment_upvotes(poll_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE polls 
  SET upvotes = upvotes + 1 
  WHERE id = poll_id;
END;
$$;

CREATE OR REPLACE FUNCTION increment_response_count(poll_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE polls 
  SET response_count = response_count + 1 
  WHERE id = poll_id;
END;
$$;

-- Insight Functions
CREATE OR REPLACE FUNCTION get_js_preference_insight()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_responses integer;
  js_responses integer;
  percentage integer;
BEGIN
  -- Get total responses for programming language polls
  SELECT COUNT(*) INTO total_responses
  FROM poll_responses pr
  JOIN polls p ON pr.poll_id = p.id
  WHERE p.category = 'Technology' 
    AND p.type = 'choice'
    AND LOWER(p.question) LIKE '%programming%'
    AND pr.created_at >= NOW() - INTERVAL '2 days';
  
  IF total_responses < 10 THEN
    RETURN jsonb_build_object(
      'value', '73%',
      'question', 'of developers prefer JavaScript',
      'color', 'blue',
      'isDefault', true
    );
  END IF;
  
  -- Get JavaScript responses
  SELECT COUNT(*) INTO js_responses
  FROM poll_responses pr
  JOIN polls p ON pr.poll_id = p.id
  WHERE p.category = 'Technology' 
    AND p.type = 'choice'
    AND LOWER(p.question) LIKE '%programming%'
    AND LOWER(pr.value::text) LIKE '%javascript%'
    AND pr.created_at >= NOW() - INTERVAL '2 days';
  
  percentage := ROUND((js_responses::numeric / total_responses::numeric) * 100);
  
  RETURN jsonb_build_object(
    'value', percentage || '%',
    'question', 'of developers prefer JavaScript',
    'color', 'blue',
    'isDefault', false
  );
END;
$$;

CREATE OR REPLACE FUNCTION get_avg_sleep_insight()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  avg_sleep numeric;
BEGIN
  SELECT AVG((value)::numeric) INTO avg_sleep
  FROM poll_responses pr
  JOIN polls p ON pr.poll_id = p.id
  WHERE LOWER(p.question) LIKE '%sleep%' 
    AND p.type = 'numeric'
    AND pr.created_at >= NOW() - INTERVAL '2 days';
  
  IF avg_sleep IS NULL THEN
    RETURN jsonb_build_object(
      'value', '6.2',
      'question', 'hours of sleep on average',
      'color', 'purple',
      'isDefault', true
    );
  END IF;
  
  RETURN jsonb_build_object(
    'value', ROUND(avg_sleep, 1)::text,
    'question', 'hours of sleep on average',
    'color', 'purple',
    'isDefault', false
  );
END;
$$;

CREATE OR REPLACE FUNCTION get_work_life_balance_insight()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  avg_balance numeric;
  percentage integer;
BEGIN
  SELECT AVG((value)::numeric) INTO avg_balance
  FROM poll_responses pr
  JOIN polls p ON pr.poll_id = p.id
  WHERE LOWER(p.question) LIKE '%balance%' 
    AND p.type = 'slider'
    AND pr.created_at >= NOW() - INTERVAL '2 days';
  
  IF avg_balance IS NULL THEN
    RETURN jsonb_build_object(
      'value', '67%',
      'question', 'work-life balance satisfaction rate',
      'color', 'green',
      'isDefault', true
    );
  END IF;
  
  percentage := ROUND((avg_balance / 10) * 100);
  
  RETURN jsonb_build_object(
    'value', percentage || '%',
    'question', 'work-life balance satisfaction rate',
    'color', 'green',
    'isDefault', false
  );
END;
$$;

CREATE OR REPLACE FUNCTION get_remote_work_preference_insight()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_responses integer;
  yes_responses integer;
  percentage integer;
BEGIN
  SELECT COUNT(*) INTO total_responses
  FROM poll_responses pr
  JOIN polls p ON pr.poll_id = p.id
  WHERE LOWER(p.question) LIKE '%remote%' 
    AND p.type = 'boolean'
    AND pr.created_at >= NOW() - INTERVAL '2 days';
  
  IF total_responses < 8 THEN
    RETURN jsonb_build_object(
      'value', '67%',
      'question', 'prefer working remotely',
      'color', 'orange',
      'isDefault', true
    );
  END IF;
  
  SELECT COUNT(*) INTO yes_responses
  FROM poll_responses pr
  JOIN polls p ON pr.poll_id = p.id
  WHERE LOWER(p.question) LIKE '%remote%' 
    AND p.type = 'boolean'
    AND (pr.value)::boolean = true
    AND pr.created_at >= NOW() - INTERVAL '2 days';
  
  percentage := ROUND((yes_responses::numeric / total_responses::numeric) * 100);
  
  RETURN jsonb_build_object(
    'value', percentage || '%',
    'question', 'prefer working remotely',
    'color', 'orange',
    'isDefault', false
  );
END;
$$;

CREATE OR REPLACE FUNCTION get_avg_coding_hours_insight()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  avg_hours numeric;
BEGIN
  SELECT AVG((value)::numeric) INTO avg_hours
  FROM poll_responses pr
  JOIN polls p ON pr.poll_id = p.id
  WHERE LOWER(p.question) LIKE '%coding%' 
    AND LOWER(p.question) LIKE '%hours%'
    AND p.type = 'numeric'
    AND pr.created_at >= NOW() - INTERVAL '2 days';
  
  IF avg_hours IS NULL THEN
    RETURN jsonb_build_object(
      'value', '4.8',
      'question', 'hours of coding per day on average',
      'color', 'pink',
      'isDefault', true
    );
  END IF;
  
  RETURN jsonb_build_object(
    'value', ROUND(avg_hours, 1)::text,
    'question', 'hours of coding per day on average',
    'color', 'pink',
    'isDefault', false
  );
END;
$$;

CREATE OR REPLACE FUNCTION get_young_professionals_insight()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_responses integer;
  young_responses integer;
  percentage integer;
BEGIN
  SELECT COUNT(*) INTO total_responses
  FROM poll_responses pr
  WHERE pr.age_range IS NOT NULL
    AND pr.created_at >= NOW() - INTERVAL '2 days';
  
  IF total_responses < 20 THEN
    RETURN jsonb_build_object(
      'value', '85%',
      'question', 'of respondents are young professionals',
      'color', 'yellow',
      'isDefault', true
    );
  END IF;
  
  SELECT COUNT(*) INTO young_responses
  FROM poll_responses pr
  WHERE pr.age_range IN ('25-34', '18-24')
    AND pr.created_at >= NOW() - INTERVAL '2 days';
  
  percentage := ROUND((young_responses::numeric / total_responses::numeric) * 100);
  
  RETURN jsonb_build_object(
    'value', percentage || '%',
    'question', 'of respondents are young professionals',
    'color', 'yellow',
    'isDefault', false
  );
END;
$$;

CREATE OR REPLACE FUNCTION get_all_insights()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  insights jsonb[];
BEGIN
  -- Collect all insights
  insights := ARRAY[
    get_js_preference_insight(),
    get_avg_sleep_insight(),
    get_work_life_balance_insight(),
    get_remote_work_preference_insight(),
    get_avg_coding_hours_insight(),
    get_young_professionals_insight()
  ];
  
  RETURN jsonb_build_object('insights', to_jsonb(insights));
END;
$$;