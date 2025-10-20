-- Add household and financial information fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS household_income TEXT,
ADD COLUMN IF NOT EXISTS baby_budget_monthly TEXT,
ADD COLUMN IF NOT EXISTS education_level TEXT,
ADD COLUMN IF NOT EXISTS housing_status TEXT,
ADD COLUMN IF NOT EXISTS household_size INTEGER,
ADD COLUMN IF NOT EXISTS employment_status TEXT,
ADD COLUMN IF NOT EXISTS partner_status TEXT;