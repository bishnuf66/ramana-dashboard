-- Fix image_url to cover_image migration
-- Run this in your Supabase SQL Editor

-- Step 1: Add new columns if they don't exist
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS cover_image TEXT,
ADD COLUMN IF NOT EXISTS gallery_images JSONB DEFAULT '[]'::jsonb;

-- Step 2: Migrate existing data from image_url to cover_image (if image_url exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'image_url') THEN
    UPDATE products 
    SET cover_image = image_url 
    WHERE cover_image IS NULL AND image_url IS NOT NULL;
  END IF;
END $$;

-- Step 3: Make image_url nullable (so it doesn't cause errors)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'image_url') THEN
    ALTER TABLE products ALTER COLUMN image_url DROP NOT NULL;
  END IF;
END $$;

-- Step 4: Make cover_image NOT NULL (only if you have data or want to enforce it)
-- Uncomment the line below if you want cover_image to be required:
-- ALTER TABLE products ALTER COLUMN cover_image SET NOT NULL;

-- Step 5: (Optional) Remove image_url column entirely after migration
-- Uncomment the line below if you want to remove the old column:
-- ALTER TABLE products DROP COLUMN IF EXISTS image_url;

