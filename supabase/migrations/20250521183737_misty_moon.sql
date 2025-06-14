/*
  # Add demographic fields to profiles table

  1. Changes
    - Add age_range TEXT column to profiles table
    - Add gender TEXT column to profiles table
    - Add region TEXT column to profiles table
    - Add occupation TEXT column to profiles table
  
  These fields will store user demographic information that was previously kept in local storage.
*/

-- Add demographic fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS age_range TEXT,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS region TEXT,
ADD COLUMN IF NOT EXISTS occupation TEXT;