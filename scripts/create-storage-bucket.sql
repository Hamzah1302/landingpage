-- Run this in Supabase SQL Editor to create the article-images storage bucket

-- Create the storage bucket for article images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'article-images',
  'article-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Allow public to read images
CREATE POLICY IF NOT EXISTS "Public can view article images"
ON storage.objects FOR SELECT
USING (bucket_id = 'article-images');

-- Allow authenticated users to upload images
CREATE POLICY IF NOT EXISTS "Authenticated users can upload article images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'article-images');

-- Allow authenticated users to delete images
CREATE POLICY IF NOT EXISTS "Authenticated users can delete article images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'article-images');
