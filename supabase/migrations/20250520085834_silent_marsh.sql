/*
  # Insert mock data for QuantumPoll

  1. Sample Data
    - Creates sample polls of different types
    - Adds poll options for choice-type polls
    - Inserts sample responses with demographic data

  2. Data Types
    - Boolean polls (yes/no questions)
    - Numeric polls (number input)
    - Slider polls (range selection)
    - Choice polls (multiple choice)
*/

-- Insert sample polls
INSERT INTO polls (creator_id, question, description, type, min_value, max_value, upvotes, response_count, is_active, demographic_filters)
VALUES
  -- Boolean poll
  ((SELECT id FROM auth.users LIMIT 1), 
   'Do you prefer dark mode for coding?',
   'Share your preferred IDE theme preference',
   'boolean',
   NULL,
   NULL,
   42,
   156,
   true,
   ARRAY['occupation', 'ageRange']),

  -- Numeric poll
  ((SELECT id FROM auth.users OFFSET 1 LIMIT 1),
   'How many hours do you sleep on average?',
   'Share your typical daily sleep duration',
   'numeric',
   0,
   24,
   89,
   234,
   true,
   ARRAY['ageRange', 'occupation', 'gender']),

  -- Slider poll
  ((SELECT id FROM auth.users LIMIT 1),
   'Rate your work-life balance (1-10)',
   'How satisfied are you with your current work-life balance?',
   'slider',
   1,
   10,
   167,
   445,
   true,
   ARRAY['occupation', 'region']),

  -- Choice poll
  ((SELECT id FROM auth.users OFFSET 1 LIMIT 1),
   'Which programming language do you use most?',
   'Select your primary programming language',
   'choice',
   NULL,
   NULL,
   256,
   789,
   true,
   ARRAY['occupation', 'experience']);

-- Insert options for the choice poll
INSERT INTO poll_options (poll_id, text)
VALUES
  ((SELECT id FROM polls WHERE question = 'Which programming language do you use most?'), 'JavaScript'),
  ((SELECT id FROM polls WHERE question = 'Which programming language do you use most?'), 'Python'),
  ((SELECT id FROM polls WHERE question = 'Which programming language do you use most?'), 'Java'),
  ((SELECT id FROM polls WHERE question = 'Which programming language do you use most?'), 'C++'),
  ((SELECT id FROM polls WHERE question = 'Which programming language do you use most?'), 'TypeScript'),
  ((SELECT id FROM polls WHERE question = 'Which programming language do you use most?'), 'Other');

-- Insert sample responses
INSERT INTO poll_responses (poll_id, user_id, value, age_range, gender, region, occupation)
SELECT 
  p.id,
  u.id,
  CASE
    WHEN p.type = 'boolean' THEN 'true'::jsonb
    WHEN p.type = 'numeric' THEN '7'::jsonb
    WHEN p.type = 'slider' THEN '8'::jsonb
    WHEN p.type = 'choice' THEN '"JavaScript"'::jsonb
  END as value,
  '25-34',
  'male',
  'North America',
  'Technology'
FROM polls p
CROSS JOIN (SELECT id FROM auth.users LIMIT 1) u
WHERE p.type IN ('boolean', 'numeric', 'slider', 'choice')
LIMIT 1;