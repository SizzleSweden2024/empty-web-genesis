/*
  # Bulk Test Data Migration - 30 Comprehensive Polls
  
  1. New Polls (30 total)
    - Life category: 5 polls about daily habits and lifestyle
    - Relationships category: 5 polls about romantic relationships
    - Sports category: 5 polls about physical activity and sports
    - Entertainment category: 5 polls about media consumption
    - Finance category: 5 polls about money management
    - Work category: 5 polls about employment and career
    
  2. Poll Options
    - Choice-type polls include all specified options
    - Realistic response distributions
    
  3. Sample Data
    - Updates user demographics for existing users
    - Generates 50-200 realistic responses per poll
    - Smart response patterns based on demographics
*/

-- First, let's insert all the polls
INSERT INTO polls (creator_id, question, description, type, category, min_value, max_value, upvotes, response_count, is_active, demographic_filters) VALUES

-- LIFE CATEGORY (5 polls)
((SELECT id FROM auth.users ORDER BY random() LIMIT 1), 
 'How many hours of sleep do you actually get per night?', 
 'Share your actual sleep duration, not what you aim for', 
 'numeric', 
 'Life', 
 0, 
 12, 
 floor(random() * 200 + 50)::int, 
 0, 
 true, 
 ARRAY['age_range', 'occupation']),

((SELECT id FROM auth.users ORDER BY random() LIMIT 1), 
 'Do you make your bed every morning?', 
 'Morning routine habits', 
 'boolean', 
 'Life', 
 NULL, 
 NULL, 
 floor(random() * 150 + 30)::int, 
 0, 
 true, 
 ARRAY['age_range', 'gender']),

((SELECT id FROM auth.users ORDER BY random() LIMIT 1), 
 'How often do you cook meals at home?', 
 'Home cooking frequency', 
 'choice', 
 'Life', 
 NULL, 
 NULL, 
 floor(random() * 180 + 40)::int, 
 0, 
 true, 
 ARRAY['age_range', 'region']),

((SELECT id FROM auth.users ORDER BY random() LIMIT 1), 
 'What percentage of your free time do you spend on your phone?', 
 'Screen time during leisure hours', 
 'slider', 
 'Life', 
 0, 
 100, 
 floor(random() * 220 + 60)::int, 
 0, 
 true, 
 ARRAY['age_range', 'gender']),

((SELECT id FROM auth.users ORDER BY random() LIMIT 1), 
 'How many close friends do you have that you could call in an emergency?', 
 'Your inner circle size', 
 'numeric', 
 'Life', 
 0, 
 20, 
 floor(random() * 160 + 45)::int, 
 0, 
 true, 
 ARRAY['age_range', 'region']),

-- RELATIONSHIPS CATEGORY (5 polls)
((SELECT id FROM auth.users ORDER BY random() LIMIT 1), 
 'How many serious relationships have you been in?', 
 'Long-term relationship count', 
 'numeric', 
 'Relationships', 
 0, 
 15, 
 floor(random() * 140 + 35)::int, 
 0, 
 true, 
 ARRAY['age_range', 'gender']),

((SELECT id FROM auth.users ORDER BY random() LIMIT 1), 
 'Do you believe in soulmates?', 
 'Romantic beliefs and perspectives', 
 'boolean', 
 'Relationships', 
 NULL, 
 NULL, 
 floor(random() * 190 + 55)::int, 
 0, 
 true, 
 ARRAY['age_range', 'gender']),

((SELECT id FROM auth.users ORDER BY random() LIMIT 1), 
 'How long should you date before moving in together?', 
 'Relationship timeline preferences', 
 'choice', 
 'Relationships', 
 NULL, 
 NULL, 
 floor(random() * 170 + 50)::int, 
 0, 
 true, 
 ARRAY['age_range', 'gender']),

((SELECT id FROM auth.users ORDER BY random() LIMIT 1), 
 'What percentage of your arguments with your partner are about money?', 
 'Financial conflict frequency', 
 'slider', 
 'Relationships', 
 0, 
 100, 
 floor(random() * 120 + 25)::int, 
 0, 
 true, 
 ARRAY['age_range', 'occupation']),

((SELECT id FROM auth.users ORDER BY random() LIMIT 1), 
 'Have you ever checked your partner''s phone without permission?', 
 'Privacy and trust in relationships', 
 'boolean', 
 'Relationships', 
 NULL, 
 NULL, 
 floor(random() * 130 + 30)::int, 
 0, 
 true, 
 ARRAY['age_range', 'gender']),

-- SPORTS CATEGORY (5 polls)
((SELECT id FROM auth.users ORDER BY random() LIMIT 1), 
 'How many hours per week do you exercise?', 
 'Weekly physical activity time', 
 'numeric', 
 'Sports', 
 0, 
 30, 
 floor(random() * 180 + 40)::int, 
 0, 
 true, 
 ARRAY['age_range', 'gender']),

((SELECT id FROM auth.users ORDER BY random() LIMIT 1), 
 'Do you consider esports to be "real sports"?', 
 'Modern sports definition debate', 
 'boolean', 
 'Sports', 
 NULL, 
 NULL, 
 floor(random() * 250 + 70)::int, 
 0, 
 true, 
 ARRAY['age_range', 'gender']),

((SELECT id FROM auth.users ORDER BY random() LIMIT 1), 
 'What''s your favorite way to stay active?', 
 'Preferred exercise methods', 
 'choice', 
 'Sports', 
 NULL, 
 NULL, 
 floor(random() * 200 + 55)::int, 
 0, 
 true, 
 ARRAY['age_range', 'gender']),

((SELECT id FROM auth.users ORDER BY random() LIMIT 1), 
 'How much would you pay for monthly gym membership? in USD', 
 'Fitness budget preferences', 
 'numeric', 
 'Sports', 
 0, 
 200, 
 floor(random() * 160 + 35)::int, 
 0, 
 true, 
 ARRAY['age_range', 'region']),

((SELECT id FROM auth.users ORDER BY random() LIMIT 1), 
 'Do you watch more sports or play more sports?', 
 'Active vs passive sports engagement', 
 'choice', 
 'Sports', 
 NULL, 
 NULL, 
 floor(random() * 140 + 30)::int, 
 0, 
 true, 
 ARRAY['age_range', 'gender']),

-- ENTERTAINMENT CATEGORY (5 polls)
((SELECT id FROM auth.users ORDER BY random() LIMIT 1), 
 'How many streaming services do you pay for?', 
 'Subscription service count', 
 'numeric', 
 'Entertainment', 
 0, 
 10, 
 floor(random() * 190 + 50)::int, 
 0, 
 true, 
 ARRAY['age_range', 'region']),

((SELECT id FROM auth.users ORDER BY random() LIMIT 1), 
 'Do you still watch TV shows when they air live?', 
 'Traditional vs on-demand viewing habits', 
 'boolean', 
 'Entertainment', 
 NULL, 
 NULL, 
 floor(random() * 170 + 45)::int, 
 0, 
 true, 
 ARRAY['age_range', 'region']),

((SELECT id FROM auth.users ORDER BY random() LIMIT 1), 
 'What percentage of movies do you watch at home vs. in theaters?', 
 'Home viewing vs cinema preference', 
 'slider', 
 'Entertainment', 
 0, 
 100, 
 floor(random() * 150 + 40)::int, 
 0, 
 true, 
 ARRAY['age_range', 'region']),

((SELECT id FROM auth.users ORDER BY random() LIMIT 1), 
 'How do you discover new music?', 
 'Music discovery methods', 
 'choice', 
 'Entertainment', 
 NULL, 
 NULL, 
 floor(random() * 210 + 60)::int, 
 0, 
 true, 
 ARRAY['age_range', 'gender']),

((SELECT id FROM auth.users ORDER BY random() LIMIT 1), 
 'How many books did you read last year?', 
 'Annual reading habits', 
 'numeric', 
 'Entertainment', 
 0, 
 50, 
 floor(random() * 130 + 35)::int, 
 0, 
 true, 
 ARRAY['age_range', 'occupation']),

-- FINANCE CATEGORY (5 polls)
((SELECT id FROM auth.users ORDER BY random() LIMIT 1), 
 'What percentage of your income do you save each month?', 
 'Monthly savings rate', 
 'slider', 
 'Finance', 
 0, 
 100, 
 floor(random() * 180 + 50)::int, 
 0, 
 true, 
 ARRAY['age_range', 'occupation']),

((SELECT id FROM auth.users ORDER BY random() LIMIT 1), 
 'Do you have a budget that you actually follow?', 
 'Budgeting habits and discipline', 
 'boolean', 
 'Finance', 
 NULL, 
 NULL, 
 floor(random() * 160 + 40)::int, 
 0, 
 true, 
 ARRAY['age_range', 'occupation']),

((SELECT id FROM auth.users ORDER BY random() LIMIT 1), 
 'How much debt do you currently have (excluding mortgage) in USD?', 
 'Personal debt levels', 
 'choice', 
 'Finance', 
 NULL, 
 NULL, 
 floor(random() * 140 + 30)::int, 
 0, 
 true, 
 ARRAY['age_range', 'occupation']),

((SELECT id FROM auth.users ORDER BY random() LIMIT 1), 
 'At what age do you expect to retire?', 
 'Retirement planning timeline', 
 'numeric', 
 'Finance', 
 50, 
 80, 
 floor(random() * 200 + 55)::int, 
 0, 
 true, 
 ARRAY['age_range', 'occupation']),

((SELECT id FROM auth.users ORDER BY random() LIMIT 1), 
 'Have you ever invested in cryptocurrency?', 
 'Crypto investment experience', 
 'boolean', 
 'Finance', 
 NULL, 
 NULL, 
 floor(random() * 220 + 65)::int, 
 0, 
 true, 
 ARRAY['age_range', 'occupation']),

-- WORK CATEGORY (5 polls)
((SELECT id FROM auth.users ORDER BY random() LIMIT 1), 
 'How many hours do you actually work per week?', 
 'Real working hours vs official schedule', 
 'numeric', 
 'Work', 
 0, 
 80, 
 floor(random() * 190 + 50)::int, 
 0, 
 true, 
 ARRAY['age_range', 'occupation']),

((SELECT id FROM auth.users ORDER BY random() LIMIT 1), 
 'Do you enjoy your current job?', 
 'Job satisfaction levels', 
 'boolean', 
 'Work', 
 NULL, 
 NULL, 
 floor(random() * 170 + 45)::int, 
 0, 
 true, 
 ARRAY['age_range', 'occupation']),

((SELECT id FROM auth.users ORDER BY random() LIMIT 1), 
 'How often do you work from home?', 
 'Remote work frequency', 
 'choice', 
 'Work', 
 NULL, 
 NULL, 
 floor(random() * 180 + 50)::int, 
 0, 
 true, 
 ARRAY['age_range', 'occupation']),

((SELECT id FROM auth.users ORDER BY random() LIMIT 1), 
 'What percentage of your workday is spent in meetings?', 
 'Meeting load and time management', 
 'slider', 
 'Work', 
 0, 
 100, 
 floor(random() * 150 + 35)::int, 
 0, 
 true, 
 ARRAY['age_range', 'occupation']),

((SELECT id FROM auth.users ORDER BY random() LIMIT 1), 
 'Have you ever been fired or laid off?', 
 'Employment history experiences', 
 'boolean', 
 'Work', 
 NULL, 
 NULL, 
 floor(random() * 120 + 25)::int, 
 0, 
 true, 
 ARRAY['age_range', 'occupation']);

-- Insert options for choice-type polls
INSERT INTO poll_options (poll_id, text) VALUES
-- How often do you cook meals at home?
((SELECT id FROM polls WHERE question = 'How often do you cook meals at home?'), 'Never'),
((SELECT id FROM polls WHERE question = 'How often do you cook meals at home?'), '1-2 times/week'),
((SELECT id FROM polls WHERE question = 'How often do you cook meals at home?'), '3-4 times/week'),
((SELECT id FROM polls WHERE question = 'How often do you cook meals at home?'), '5-6 times/week'),
((SELECT id FROM polls WHERE question = 'How often do you cook meals at home?'), 'Every day'),

-- How long should you date before moving in together?
((SELECT id FROM polls WHERE question = 'How long should you date before moving in together?'), '3-6 months'),
((SELECT id FROM polls WHERE question = 'How long should you date before moving in together?'), '6-12 months'),
((SELECT id FROM polls WHERE question = 'How long should you date before moving in together?'), '1-2 years'),
((SELECT id FROM polls WHERE question = 'How long should you date before moving in together?'), '2+ years'),
((SELECT id FROM polls WHERE question = 'How long should you date before moving in together?'), 'Never'),

-- What's your favorite way to stay active?
((SELECT id FROM polls WHERE question = 'What''s your favorite way to stay active?'), 'Gym/weightlifting'),
((SELECT id FROM polls WHERE question = 'What''s your favorite way to stay active?'), 'Running/jogging'),
((SELECT id FROM polls WHERE question = 'What''s your favorite way to stay active?'), 'Team sports'),
((SELECT id FROM polls WHERE question = 'What''s your favorite way to stay active?'), 'Yoga/pilates'),
((SELECT id FROM polls WHERE question = 'What''s your favorite way to stay active?'), 'Walking'),
((SELECT id FROM polls WHERE question = 'What''s your favorite way to stay active?'), 'I don''t exercise'),

-- Do you watch more sports or play more sports?
((SELECT id FROM polls WHERE question = 'Do you watch more sports or play more sports?'), 'Watch way more'),
((SELECT id FROM polls WHERE question = 'Do you watch more sports or play more sports?'), 'Watch slightly more'),
((SELECT id FROM polls WHERE question = 'Do you watch more sports or play more sports?'), 'About equal'),
((SELECT id FROM polls WHERE question = 'Do you watch more sports or play more sports?'), 'Play slightly more'),
((SELECT id FROM polls WHERE question = 'Do you watch more sports or play more sports?'), 'Play way more'),

-- How do you discover new music?
((SELECT id FROM polls WHERE question = 'How do you discover new music?'), 'Spotify/Apple recommendations'),
((SELECT id FROM polls WHERE question = 'How do you discover new music?'), 'Friends'),
((SELECT id FROM polls WHERE question = 'How do you discover new music?'), 'TikTok/social media'),
((SELECT id FROM polls WHERE question = 'How do you discover new music?'), 'Radio'),
((SELECT id FROM polls WHERE question = 'How do you discover new music?'), 'Music blogs'),
((SELECT id FROM polls WHERE question = 'How do you discover new music?'), 'I don''t seek new music'),

-- How much debt do you currently have (excluding mortgage) in USD?
((SELECT id FROM polls WHERE question = 'How much debt do you currently have (excluding mortgage) in USD?'), '$0'),
((SELECT id FROM polls WHERE question = 'How much debt do you currently have (excluding mortgage) in USD?'), '$1-5,000'),
((SELECT id FROM polls WHERE question = 'How much debt do you currently have (excluding mortgage) in USD?'), '$5,001-15,000'),
((SELECT id FROM polls WHERE question = 'How much debt do you currently have (excluding mortgage) in USD?'), '$15,001-30,000'),
((SELECT id FROM polls WHERE question = 'How much debt do you currently have (excluding mortgage) in USD?'), '$30,000+'),

-- How often do you work from home?
((SELECT id FROM polls WHERE question = 'How often do you work from home?'), 'Never'),
((SELECT id FROM polls WHERE question = 'How often do you work from home?'), '1 day/week'),
((SELECT id FROM polls WHERE question = 'How often do you work from home?'), '2-3 days/week'),
((SELECT id FROM polls WHERE question = 'How often do you work from home?'), '4 days/week'),
((SELECT id FROM polls WHERE question = 'How often do you work from home?'), 'Full-time remote');

-- Update existing user profiles with random demographic data
UPDATE profiles 
SET 
  age_range = (ARRAY['18-24', '25-34', '35-44', '45-54', '55-64', '65+'])[floor(random() * 6 + 1)],
  gender = (ARRAY['male', 'female', 'non-binary'])[floor(random() * 3 + 1)],
  region = (ARRAY['North America', 'Europe', 'Asia', 'South America', 'Africa', 'Australia'])[floor(random() * 6 + 1)],
  occupation = (ARRAY['Technology', 'Education', 'Healthcare', 'Finance', 'Retail', 'Other'])[floor(random() * 6 + 1)]
WHERE age_range IS NULL OR gender IS NULL OR region IS NULL OR occupation IS NULL;

-- Generate realistic poll responses for each poll
-- First, create a temporary table to manage the response generation
CREATE TEMP TABLE temp_poll_responses AS
SELECT DISTINCT
  p.id as poll_id,
  p.type,
  p.min_value,
  p.max_value,
  p.question,
  u.id as user_id,
  prof.age_range,
  prof.gender,
  prof.region,
  prof.occupation,
  random() as rand_sort
FROM polls p
CROSS JOIN (
  SELECT id FROM auth.users 
  ORDER BY random() 
  LIMIT 66
) u
JOIN profiles prof ON u.id = prof.id
WHERE p.created_at >= NOW() - INTERVAL '1 hour'; -- Only our newly created polls

-- Insert responses for boolean polls
INSERT INTO poll_responses (poll_id, user_id, value, age_range, gender, region, occupation)
SELECT 
  poll_id,
  user_id,
  CASE
    WHEN question ILIKE '%bed%' THEN 
      CASE WHEN random() < 0.6 THEN 'true'::jsonb ELSE 'false'::jsonb END
    WHEN question ILIKE '%soulmate%' THEN 
      CASE 
        WHEN gender = 'female' AND random() < 0.75 THEN 'true'::jsonb
        WHEN gender = 'male' AND random() < 0.55 THEN 'true'::jsonb
        ELSE 'false'::jsonb
      END
    WHEN question ILIKE '%phone%' AND question ILIKE '%permission%' THEN 
      CASE WHEN random() < 0.35 THEN 'true'::jsonb ELSE 'false'::jsonb END
    WHEN question ILIKE '%esports%' THEN 
      CASE 
        WHEN age_range IN ('18-24', '25-34') AND random() < 0.65 THEN 'true'::jsonb
        WHEN age_range IN ('35-44', '45-54') AND random() < 0.35 THEN 'true'::jsonb
        ELSE 'false'::jsonb
      END
    WHEN question ILIKE '%TV%' AND question ILIKE '%live%' THEN 
      CASE 
        WHEN age_range IN ('55-64', '65+') AND random() < 0.7 THEN 'true'::jsonb
        WHEN age_range IN ('18-24', '25-34') AND random() < 0.2 THEN 'true'::jsonb
        ELSE 'false'::jsonb
      END
    WHEN question ILIKE '%budget%' THEN 
      CASE WHEN random() < 0.45 THEN 'true'::jsonb ELSE 'false'::jsonb END
    WHEN question ILIKE '%cryptocurrency%' THEN 
      CASE 
        WHEN age_range IN ('18-24', '25-34') AND random() < 0.6 THEN 'true'::jsonb
        WHEN occupation = 'Technology' AND random() < 0.7 THEN 'true'::jsonb
        ELSE 'false'::jsonb
      END
    WHEN question ILIKE '%enjoy%' AND question ILIKE '%job%' THEN 
      CASE WHEN random() < 0.55 THEN 'true'::jsonb ELSE 'false'::jsonb END
    WHEN question ILIKE '%fired%' OR question ILIKE '%laid off%' THEN 
      CASE WHEN random() < 0.3 THEN 'true'::jsonb ELSE 'false'::jsonb END
    ELSE 
      CASE WHEN random() < 0.5 THEN 'true'::jsonb ELSE 'false'::jsonb END
  END as value,
  age_range,
  gender,
  region,
  occupation
FROM temp_poll_responses
WHERE type = 'boolean'
  AND random() < 0.85; -- 85% response rate

-- Insert responses for numeric polls
INSERT INTO poll_responses (poll_id, user_id, value, age_range, gender, region, occupation)
SELECT 
  poll_id,
  user_id,
  CASE 
    WHEN question ILIKE '%sleep%' THEN 
      to_jsonb(CASE 
        WHEN random() < 0.1 THEN floor(random() * 4 + 3)::int -- 3-6 hours (10%)
        WHEN random() < 0.6 THEN floor(random() * 3 + 6)::int -- 6-8 hours (50%)
        ELSE floor(random() * 2 + 8)::int -- 8-9 hours (40%)
      END)
    WHEN question ILIKE '%close friends%' THEN 
      to_jsonb(CASE 
        WHEN random() < 0.3 THEN floor(random() * 3 + 1)::int -- 1-3 friends (30%)
        WHEN random() < 0.7 THEN floor(random() * 4 + 3)::int -- 3-6 friends (40%)
        ELSE floor(random() * 8 + 6)::int -- 6-13 friends (30%)
      END)
    WHEN question ILIKE '%relationships%' THEN 
      to_jsonb(CASE 
        WHEN age_range IN ('18-24') THEN floor(random() * 3 + 0)::int -- 0-2
        WHEN age_range IN ('25-34') THEN floor(random() * 4 + 1)::int -- 1-4
        ELSE floor(random() * 6 + 2)::int -- 2-7
      END)
    WHEN question ILIKE '%exercise%' THEN 
      to_jsonb(CASE 
        WHEN random() < 0.3 THEN floor(random() * 3 + 0)::int -- 0-2 hours (30%)
        WHEN random() < 0.6 THEN floor(random() * 4 + 3)::int -- 3-6 hours (30%)
        ELSE floor(random() * 8 + 7)::int -- 7-14 hours (40%)
      END)
    WHEN question ILIKE '%gym membership%' THEN 
      to_jsonb(CASE 
        WHEN random() < 0.2 THEN 0 -- Free/no gym (20%)
        WHEN random() < 0.5 THEN floor(random() * 30 + 15)::int -- $15-44 (30%)
        WHEN random() < 0.8 THEN floor(random() * 40 + 45)::int -- $45-84 (30%)
        ELSE floor(random() * 60 + 85)::int -- $85-144 (20%)
      END)
    WHEN question ILIKE '%streaming%' THEN 
      to_jsonb(CASE 
        WHEN random() < 0.1 THEN 0 -- No streaming (10%)
        WHEN random() < 0.4 THEN floor(random() * 2 + 1)::int -- 1-2 services (30%)
        WHEN random() < 0.8 THEN floor(random() * 3 + 3)::int -- 3-5 services (40%)
        ELSE floor(random() * 4 + 6)::int -- 6-9 services (20%)
      END)
    WHEN question ILIKE '%books%' THEN 
      to_jsonb(CASE 
        WHEN random() < 0.4 THEN floor(random() * 3 + 0)::int -- 0-2 books (40%)
        WHEN random() < 0.7 THEN floor(random() * 8 + 3)::int -- 3-10 books (30%)
        ELSE floor(random() * 15 + 11)::int -- 11-25 books (30%)
      END)
    WHEN question ILIKE '%retire%' THEN 
      to_jsonb(CASE 
        WHEN age_range IN ('18-24', '25-34') THEN floor(random() * 10 + 60)::int -- 60-69
        ELSE floor(random() * 8 + 62)::int -- 62-69
      END)
    WHEN question ILIKE '%work%' AND question ILIKE '%hours%' THEN 
      to_jsonb(CASE 
        WHEN occupation = 'Technology' THEN floor(random() * 20 + 45)::int -- 45-64 hours
        WHEN occupation = 'Healthcare' THEN floor(random() * 25 + 40)::int -- 40-64 hours
        ELSE floor(random() * 15 + 35)::int -- 35-49 hours
      END)
    ELSE 
      to_jsonb(floor(random() * (COALESCE(max_value, 100) - COALESCE(min_value, 0) + 1) + COALESCE(min_value, 0))::int)
  END as value,
  age_range,
  gender,
  region,
  occupation
FROM temp_poll_responses
WHERE type = 'numeric'
  AND random() < 0.85;

-- Insert responses for slider polls
INSERT INTO poll_responses (poll_id, user_id, value, age_range, gender, region, occupation)
SELECT 
  poll_id,
  user_id,
  CASE 
    WHEN question ILIKE '%phone%' THEN 
      to_jsonb(CASE 
        WHEN age_range IN ('18-24', '25-34') THEN floor(random() * 30 + 60)::int -- 60-89%
        WHEN age_range IN ('35-44', '45-54') THEN floor(random() * 40 + 40)::int -- 40-79%
        ELSE floor(random() * 50 + 20)::int -- 20-69%
      END)
    WHEN question ILIKE '%arguments%' AND question ILIKE '%money%' THEN 
      to_jsonb(CASE 
        WHEN random() < 0.4 THEN floor(random() * 20 + 0)::int -- 0-19% (40%)
        WHEN random() < 0.7 THEN floor(random() * 30 + 20)::int -- 20-49% (30%)
        ELSE floor(random() * 40 + 50)::int -- 50-89% (30%)
      END)
    WHEN question ILIKE '%save%' AND question ILIKE '%income%' THEN 
      to_jsonb(CASE 
        WHEN age_range IN ('18-24') THEN floor(random() * 15 + 0)::int -- 0-14%
        WHEN age_range IN ('25-34') THEN floor(random() * 20 + 5)::int -- 5-24%
        ELSE floor(random() * 25 + 10)::int -- 10-34%
      END)
    WHEN question ILIKE '%movies%' AND question ILIKE '%home%' THEN 
      to_jsonb(floor(random() * 40 + 60)::int) -- 60-99% at home
    WHEN question ILIKE '%meetings%' THEN 
      to_jsonb(CASE 
        WHEN occupation = 'Technology' THEN floor(random() * 30 + 20)::int -- 20-49%
        WHEN occupation = 'Education' THEN floor(random() * 25 + 15)::int -- 15-39%
        ELSE floor(random() * 40 + 10)::int -- 10-49%
      END)
    ELSE 
      to_jsonb(floor(random() * (COALESCE(max_value, 100) - COALESCE(min_value, 0) + 1) + COALESCE(min_value, 0))::int)
  END as value,
  age_range,
  gender,
  region,
  occupation
FROM temp_poll_responses
WHERE type = 'slider'
  AND random() < 0.85;

-- Insert responses for choice polls - cooking frequency
INSERT INTO poll_responses (poll_id, user_id, value, age_range, gender, region, occupation)
SELECT 
  poll_id,
  user_id,
  CASE 
    WHEN random() < 0.1 THEN '"Never"'::jsonb
    WHEN random() < 0.3 THEN '"1-2 times/week"'::jsonb
    WHEN random() < 0.6 THEN '"3-4 times/week"'::jsonb
    WHEN random() < 0.85 THEN '"5-6 times/week"'::jsonb
    ELSE '"Every day"'::jsonb
  END as value,
  age_range,
  gender,
  region,
  occupation
FROM temp_poll_responses
WHERE type = 'choice' AND question ILIKE '%cook%'
  AND random() < 0.85;

-- Insert responses for choice polls - dating timeline
INSERT INTO poll_responses (poll_id, user_id, value, age_range, gender, region, occupation)
SELECT 
  poll_id,
  user_id,
  CASE 
    WHEN random() < 0.15 THEN '"3-6 months"'::jsonb
    WHEN random() < 0.45 THEN '"6-12 months"'::jsonb
    WHEN random() < 0.75 THEN '"1-2 years"'::jsonb
    WHEN random() < 0.9 THEN '"2+ years"'::jsonb
    ELSE '"Never"'::jsonb
  END as value,
  age_range,
  gender,
  region,
  occupation
FROM temp_poll_responses
WHERE type = 'choice' AND question ILIKE '%dating%'
  AND random() < 0.85;

-- Insert responses for choice polls - staying active
INSERT INTO poll_responses (poll_id, user_id, value, age_range, gender, region, occupation)
SELECT 
  poll_id,
  user_id,
  CASE 
    WHEN random() < 0.25 THEN '"Gym/weightlifting"'::jsonb
    WHEN random() < 0.4 THEN '"Running/jogging"'::jsonb
    WHEN random() < 0.5 THEN '"Team sports"'::jsonb
    WHEN random() < 0.65 THEN '"Yoga/pilates"'::jsonb
    WHEN random() < 0.85 THEN '"Walking"'::jsonb
    ELSE '"I don''t exercise"'::jsonb
  END as value,
  age_range,
  gender,
  region,
  occupation
FROM temp_poll_responses
WHERE type = 'choice' AND question ILIKE '%active%'
  AND random() < 0.85;

-- Insert responses for choice polls - watch vs play sports
INSERT INTO poll_responses (poll_id, user_id, value, age_range, gender, region, occupation)
SELECT 
  poll_id,
  user_id,
  CASE 
    WHEN random() < 0.4 THEN '"Watch way more"'::jsonb
    WHEN random() < 0.65 THEN '"Watch slightly more"'::jsonb
    WHEN random() < 0.8 THEN '"About equal"'::jsonb
    WHEN random() < 0.92 THEN '"Play slightly more"'::jsonb
    ELSE '"Play way more"'::jsonb
  END as value,
  age_range,
  gender,
  region,
  occupation
FROM temp_poll_responses
WHERE type = 'choice' AND question ILIKE '%watch%' AND question ILIKE '%play%'
  AND random() < 0.85;

-- Insert responses for choice polls - music discovery
INSERT INTO poll_responses (poll_id, user_id, value, age_range, gender, region, occupation)
SELECT 
  poll_id,
  user_id,
  CASE 
    WHEN random() < 0.45 THEN '"Spotify/Apple recommendations"'::jsonb
    WHEN age_range IN ('18-24', '25-34') AND random() < 0.7 THEN '"TikTok/social media"'::jsonb
    WHEN random() < 0.75 THEN '"Friends"'::jsonb
    WHEN random() < 0.85 THEN '"Radio"'::jsonb
    WHEN random() < 0.92 THEN '"Music blogs"'::jsonb
    ELSE '"I don''t seek new music"'::jsonb
  END as value,
  age_range,
  gender,
  region,
  occupation
FROM temp_poll_responses
WHERE type = 'choice' AND question ILIKE '%music%'
  AND random() < 0.85;

-- Insert responses for choice polls - debt levels
INSERT INTO poll_responses (poll_id, user_id, value, age_range, gender, region, occupation)
SELECT 
  poll_id,
  user_id,
  CASE 
    WHEN random() < 0.35 THEN '"$0"'::jsonb
    WHEN random() < 0.55 THEN '"$1-5,000"'::jsonb
    WHEN random() < 0.75 THEN '"$5,001-15,000"'::jsonb
    WHEN random() < 0.9 THEN '"$15,001-30,000"'::jsonb
    ELSE '"$30,000+"'::jsonb
  END as value,
  age_range,
  gender,
  region,
  occupation
FROM temp_poll_responses
WHERE type = 'choice' AND question ILIKE '%debt%'
  AND random() < 0.85;

-- Insert responses for choice polls - work from home
INSERT INTO poll_responses (poll_id, user_id, value, age_range, gender, region, occupation)
SELECT 
  poll_id,
  user_id,
  CASE 
    WHEN occupation = 'Technology' AND random() < 0.4 THEN '"Full-time remote"'::jsonb
    WHEN occupation IN ('Technology', 'Finance') AND random() < 0.6 THEN '"2-3 days/week"'::jsonb
    WHEN random() < 0.35 THEN '"Never"'::jsonb
    WHEN random() < 0.5 THEN '"1 day/week"'::jsonb
    WHEN random() < 0.75 THEN '"2-3 days/week"'::jsonb
    WHEN random() < 0.88 THEN '"4 days/week"'::jsonb
    ELSE '"Full-time remote"'::jsonb
  END as value,
  age_range,
  gender,
  region,
  occupation
FROM temp_poll_responses
WHERE type = 'choice' AND question ILIKE '%work from home%'
  AND random() < 0.85;

-- Update response counts for polls based on actual responses
UPDATE polls 
SET response_count = (
  SELECT COUNT(*)
  FROM poll_responses 
  WHERE poll_responses.poll_id = polls.id
)
WHERE created_at >= NOW() - INTERVAL '1 hour';

-- Clean up temporary table
DROP TABLE temp_poll_responses;

-- Final verification message
DO $$
DECLARE
  poll_count integer;
  response_count integer;
  user_count integer;
BEGIN
  SELECT COUNT(*) INTO poll_count FROM polls WHERE created_at >= NOW() - INTERVAL '1 hour';
  SELECT COUNT(*) INTO response_count FROM poll_responses WHERE created_at >= NOW() - INTERVAL '1 hour';
  SELECT COUNT(*) INTO user_count FROM profiles WHERE age_range IS NOT NULL;
  
  RAISE NOTICE 'Migration completed successfully:';
  RAISE NOTICE '- Created % new polls', poll_count;
  RAISE NOTICE '- Generated % poll responses', response_count;
  RAISE NOTICE '- Updated % user profiles with demographics', user_count;
END $$;