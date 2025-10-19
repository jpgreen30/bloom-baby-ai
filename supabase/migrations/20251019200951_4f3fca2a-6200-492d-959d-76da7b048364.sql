-- Create table for caching generated baby images
CREATE TABLE generated_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  baby_id uuid REFERENCES babies(id) ON DELETE CASCADE NOT NULL,
  cache_key text NOT NULL,
  image_data text NOT NULL,
  prompt text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(baby_id, cache_key)
);

-- Enable RLS
ALTER TABLE generated_images ENABLE ROW LEVEL SECURITY;

-- Users can view images for their own babies
CREATE POLICY "Users can view own baby images"
  ON generated_images FOR SELECT
  USING (
    baby_id IN (
      SELECT id FROM babies WHERE user_id = auth.uid()
    )
  );

-- System can insert images (edge functions run with service role)
CREATE POLICY "System can insert images"
  ON generated_images FOR INSERT
  WITH CHECK (true);

-- System can update images
CREATE POLICY "System can update images"
  ON generated_images FOR UPDATE
  USING (true);

-- Create index for faster lookups
CREATE INDEX idx_generated_images_baby_cache ON generated_images(baby_id, cache_key);