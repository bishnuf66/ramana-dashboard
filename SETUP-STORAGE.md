# Supabase Storage Setup Guide

## Step 1: Create Storage Bucket

1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **"New bucket"**
4. Enter bucket name: `product-images`
5. Check **"Public bucket"** (so images can be accessed publicly)
6. Click **"Create bucket"**

## Step 2: Set Up Storage Policies

Go to **SQL Editor** and run this SQL:

```sql
-- Allow public read access to product images
CREATE POLICY "Public can view product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

-- Allow authenticated admins to upload images
CREATE POLICY "Admins can upload product images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-images' AND
    is_admin(auth.uid())
  );

-- Allow admins to update images
CREATE POLICY "Admins can update product images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'product-images' AND
    is_admin(auth.uid())
  );

-- Allow admins to delete images
CREATE POLICY "Admins can delete product images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'product-images' AND
    is_admin(auth.uid())
  );
```

## Step 3: Update Database Schema

Run the `update-schema-images.sql` file in your SQL Editor to add the new columns.

## Step 4: Verify Setup

1. Try uploading a product through the admin panel
2. Check that images appear in Storage > product-images
3. Verify images are accessible via public URLs

## Troubleshooting

### Images not uploading
- Check that the bucket name matches exactly: `product-images`
- Verify storage policies are created correctly
- Check browser console for errors

### Images not displaying
- Ensure bucket is set to "Public"
- Check image URLs in the database
- Verify CORS settings if needed

### Permission errors
- Make sure you're logged in as an admin
- Verify the `is_admin()` function exists and works
- Check that your user is in the `admin_users` table

