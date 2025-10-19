-- Add parent/user information fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS first_name text,
ADD COLUMN IF NOT EXISTS last_name text,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS zip_code text,
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS onboarding_step integer DEFAULT 0;

-- Add constraints
ALTER TABLE profiles 
ADD CONSTRAINT phone_format CHECK (phone IS NULL OR phone ~ '^\+?[1-9]\d{1,14}$'),
ADD CONSTRAINT zip_code_format CHECK (zip_code IS NULL OR zip_code ~ '^\d{5}(-\d{4})?$');

-- Create index for zip code lookups
CREATE INDEX IF NOT EXISTS idx_profiles_zip_code ON profiles(zip_code) WHERE zip_code IS NOT NULL;

-- Create user preferences table for interests and notification settings
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  interests jsonb DEFAULT '[]'::jsonb,
  email_notifications jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on user_preferences
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_preferences
CREATE POLICY "Users can view own preferences"
ON user_preferences FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own preferences"
ON user_preferences FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own preferences"
ON user_preferences FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete own preferences"
ON user_preferences FOR DELETE
USING (user_id = auth.uid());

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_preferences_timestamp
BEFORE UPDATE ON user_preferences
FOR EACH ROW
EXECUTE FUNCTION update_user_preferences_updated_at();