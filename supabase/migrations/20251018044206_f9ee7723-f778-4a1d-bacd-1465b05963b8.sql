-- Create storage bucket for marketplace item images
INSERT INTO storage.buckets (id, name, public)
VALUES ('marketplace-items', 'marketplace-items', true);

-- Allow authenticated users to upload images
CREATE POLICY "Users can upload marketplace images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'marketplace-items');

-- Allow users to update their own images
CREATE POLICY "Users can update own marketplace images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'marketplace-items' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own images
CREATE POLICY "Users can delete own marketplace images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'marketplace-items' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public access to view images
CREATE POLICY "Anyone can view marketplace images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'marketplace-items');