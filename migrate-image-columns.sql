-- Migration script to update products table from image_url to cover_image
-- Run this in your Supabase SQL Editor

-- Step 1: Add new columns if they don't exist
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS cover_image TEXT,
ADD COLUMN IF NOT EXISTS gallery_images JSONB DEFAULT '[]'::jsonb;

-- Step 2: Migrate existing data from image_url to cover_image
UPDATE products 
SET cover_image = image_url 
WHERE cover_image IS NULL AND image_url IS NOT NULL;

-- Step 3: Make image_url nullable (or remove it if you want)
-- Option A: Make it nullable
ALTER TABLE products ALTER COLUMN image_url DROP NOT NULL;

-- Option B: Remove the column entirely (uncomment if you want to remove it)
-- ALTER TABLE products DROP COLUMN IF EXISTS image_url;

-- Step 4: Make cover_image required (if you want)
-- ALTER TABLE products ALTER COLUMN cover_image SET NOT NULL;

