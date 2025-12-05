-- Update products table to support cover_image and gallery_images
-- Run this in your Supabase SQL Editor

-- Add new columns if they don't exist
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS cover_image TEXT,
ADD COLUMN IF NOT EXISTS gallery_images JSONB DEFAULT '[]'::jsonb;

-- Update existing image_url to cover_image if needed (optional migration)
-- UPDATE products SET cover_image = image_url WHERE cover_image IS NULL AND image_url IS NOT NULL;

-- Create storage bucket for product images (run this in Supabase Dashboard > Storage)
-- Or use: INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

-- Set up storage policies (run after creating bucket)
-- Allow public read access
-- CREATE POLICY "Public can view product images" ON storage.objects
--   FOR SELECT USING (bucket_id = 'product-images');

-- Allow authenticated admins to upload
-- CREATE POLICY "Admins can upload product images" ON storage.objects
--   FOR INSERT WITH CHECK (
--     bucket_id = 'product-images' AND
--     is_admin(auth.uid())
--   );

-- Allow admins to delete images
-- CREATE POLICY "Admins can delete product images" ON storage.objects
--   FOR DELETE USING (
--     bucket_id = 'product-images' AND
--     is_admin(auth.uid())
--   );

