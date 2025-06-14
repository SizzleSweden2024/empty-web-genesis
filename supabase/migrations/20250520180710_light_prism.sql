/*
  # Add sample polls and responses
  
  1. New Data
    - 15 diverse polls (4 boolean, 3 numeric, 3 slider, 5 choice)
    - Poll options for choice-type polls
    - 15 responses per poll using existing users
    - Demographic data for responses
    
  2. Structure
    - Uses existing users from auth.users
    - Maintains referential integrity
    - Includes realistic sample data
*/

-- Insert sample polls
WITH poll_data AS (
  SELECT * FROM (VALUES
    -- Boolean Polls
    ((SELECT id FROM auth.users ORDER BY random() LIMIT 1), 'Do you code on weekends?', 'Share your weekend coding habits', 'boolean', NULL, NULL, ARRAY['occupation', 'ageRange']),
    ((SELECT id FROM auth.users ORDER BY random() LIMIT 1), 'Have you ever contributed to open source?', 'Tell us about your open source experience', 'boolean', NULL, NULL, ARRAY['occupation']),
    ((SELECT id FROM auth.users ORDER BY random() LIMIT 1), 'Do you prefer remote work?', 'Work preference survey', 'boolean', NULL, NULL, ARRAY['occupation', 'region']),
    ((SELECT id FROM auth.users ORDER BY random() LIMIT 1), 'Are you learning a new language?', 'Current learning status', 'boolean', NULL, NULL, ARRAY['occupation', 'ageRange']),
    
    -- Numeric Polls
    ((SELECT id FROM auth.users ORDER BY random() LIMIT 1), 'How many programming languages do you know?', 'Count languages you''re comfortable with', 'numeric', 1, 20, ARRAY['occupation', 'experience']),
    ((SELECT id FROM auth.users ORDER BY random() LIMIT 1), 'How many hours do you spend coding daily?', 'Average daily coding time', 'numeric', 0, 24, ARRAY['occupation', 'ageRange']),
    ((SELECT id FROM auth.users ORDER BY random() LIMIT 1), 'How many monitors do you use?', 'Setup survey', 'numeric', 1, 6, ARRAY['occupation']),
    
    -- Slider Polls
    ((SELECT id FROM auth.users ORDER BY random() LIMIT 1), 'Rate your work-life balance', 'How well do you balance work and life?', 'slider', 1, 10, ARRAY['occupation', 'ageRange']),
    ((SELECT id FROM auth.users ORDER BY random() LIMIT 1), 'How stressed are you at work?', 'Current stress levels', 'slider', 1, 10, ARRAY['occupation', 'region']),
    ((SELECT id FROM auth.users ORDER BY random() LIMIT 1), 'Rate your job satisfaction', 'Current job satisfaction', 'slider', 1, 10, ARRAY['occupation', 'ageRange']),
    
    -- Choice Polls
    ((SELECT id FROM auth.users ORDER BY random() LIMIT 1), 'What''s your primary programming language?', 'Main language used at work', 'choice', NULL, NULL, ARRAY['occupation']),
    ((SELECT id FROM auth.users ORDER BY random() LIMIT 1), 'Which framework do you use most?', 'Primary web framework', 'choice', NULL, NULL, ARRAY['occupation']),
    ((SELECT id FROM auth.users ORDER BY random() LIMIT 1), 'What''s your preferred IDE?', 'Code editor preference', 'choice', NULL, NULL, ARRAY['occupation']),
    ((SELECT id FROM auth.users ORDER BY random() LIMIT 1), 'How do you learn new technologies?', 'Learning methods', 'choice', NULL, NULL, ARRAY['occupation', 'ageRange']),
    ((SELECT id FROM auth.users ORDER BY random() LIMIT 1), 'What''s your deployment frequency?', 'How often do you deploy?', 'choice', NULL, NULL, ARRAY['occupation'])
  ) AS t(creator_id, question, description, type, min_value, max_value, demographic_filters)
)
INSERT INTO polls (creator_id, question, description, type, min_value, max_value, upvotes, response_count, is_active, demographic_filters)
SELECT 
  creator_id,
  question,
  description,
  type,
  min_value,
  max_value,
  floor(random() * 500)::int as upvotes,
  floor(random() * 1000 + 100)::int as response_count,
  true as is_active,
  demographic_filters
FROM poll_data;

-- Insert options for choice polls
WITH choice_options AS (
  SELECT * FROM (VALUES
    ('What''s your primary programming language?', ARRAY['JavaScript', 'Python', 'Java', 'C++', 'TypeScript', 'Ruby', 'Go', 'Other']),
    ('Which framework do you use most?', ARRAY['React', 'Vue', 'Angular', 'Svelte', 'Next.js', 'Nuxt', 'Other']),
    ('What''s your preferred IDE?', ARRAY['VS Code', 'IntelliJ', 'WebStorm', 'Sublime Text', 'Vim', 'Other']),
    ('How do you learn new technologies?', ARRAY['Documentation', 'Video Tutorials', 'Books', 'Courses', 'Practice Projects', 'Mentoring']),
    ('What''s your deployment frequency?', ARRAY['Multiple times per day', 'Daily', 'Weekly', 'Bi-weekly', 'Monthly', 'Quarterly'])
  ) AS t(question, options)
)
INSERT INTO poll_options (poll_id, text)
SELECT p.id, unnest(co.options)
FROM polls p
JOIN choice_options co ON p.question = co.question
WHERE p.type = 'choice';

-- Insert sample responses
INSERT INTO poll_responses (poll_id, user_id, value, age_range, gender, region, occupation)
SELECT 
  p.id,
  u.id,
  CASE
    WHEN p.type = 'boolean' THEN 
      (ARRAY['"true"', '"false"'])[floor(random() * 2 + 1)]::jsonb
    WHEN p.type = 'numeric' THEN 
      to_jsonb(floor(random() * (COALESCE(p.max_value, 100) - COALESCE(p.min_value, 0) + 1) + COALESCE(p.min_value, 0))::int)
    WHEN p.type = 'slider' THEN 
      to_jsonb(floor(random() * (COALESCE(p.max_value, 10) - COALESCE(p.min_value, 1) + 1) + COALESCE(p.min_value, 1))::int)
    WHEN p.type = 'choice' THEN
      (SELECT to_jsonb(text) FROM poll_options WHERE poll_id = p.id ORDER BY random() LIMIT 1)
  END as value,
  (ARRAY['18-24', '25-34', '35-44', '45-54', '55-64', '65+'])[floor(random() * 6 + 1)] as age_range,
  (ARRAY['male', 'female', 'non-binary'])[floor(random() * 3 + 1)] as gender,
  (ARRAY['North America', 'Europe', 'Asia', 'South America', 'Africa', 'Australia'])[floor(random() * 6 + 1)] as region,
  (ARRAY['Technology', 'Education', 'Healthcare', 'Finance', 'Retail', 'Other'])[floor(random() * 6 + 1)] as occupation
FROM polls p
CROSS JOIN (
  SELECT id FROM auth.users 
  ORDER BY random() 
  LIMIT 15
) u
WHERE p.is_active = true;