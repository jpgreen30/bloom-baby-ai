-- Add display name to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Create storage bucket for social post images
INSERT INTO storage.buckets (id, name, public)
VALUES ('social-posts', 'social-posts', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for social post images
CREATE POLICY "Anyone can view social post images"
ON storage.objects FOR SELECT
USING (bucket_id = 'social-posts');

CREATE POLICY "Authenticated users can upload social post images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'social-posts' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can delete their own social post images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'social-posts' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);