/*
  # Add category column to polls table

  1. Changes
    - Add category TEXT column to polls table
    - Set default categories for existing polls
  
  2. Data
    - Categorize existing polls based on their content
*/

-- Add category column to polls table
ALTER TABLE public.polls
ADD COLUMN IF NOT EXISTS category TEXT;

-- Set default categories for existing polls based on their content
UPDATE public.polls 
SET category = CASE
  WHEN question ILIKE '%work%' OR question ILIKE '%job%' OR question ILIKE '%programming%' OR question ILIKE '%code%' OR question ILIKE '%deploy%' OR question ILIKE '%framework%' OR question ILIKE '%language%' OR question ILIKE '%IDE%' THEN 'Technology'
  WHEN question ILIKE '%sleep%' OR question ILIKE '%stress%' OR question ILIKE '%health%' THEN 'Health'
  WHEN question ILIKE '%balance%' OR question ILIKE '%satisfaction%' OR question ILIKE '%relationship%' THEN 'Life'
  WHEN question ILIKE '%learn%' OR question ILIKE '%education%' OR question ILIKE '%course%' THEN 'Education'
  WHEN question ILIKE '%money%' OR question ILIKE '%spend%' OR question ILIKE '%income%' OR question ILIKE '%crypto%' THEN 'Finance'
  WHEN question ILIKE '%social%' OR question ILIKE '%media%' OR question ILIKE '%platform%' OR question ILIKE '%TV%' OR question ILIKE '%entertainment%' THEN 'Entertainment'
  ELSE 'Life'
END
WHERE category IS NULL;