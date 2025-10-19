-- Create storage bucket for baby images
INSERT INTO storage.buckets (id, name, public)
VALUES ('baby-images', 'baby-images', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for baby-images bucket
CREATE POLICY "Users can view their own baby images"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'baby-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload their own baby images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'baby-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own baby images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'baby-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);