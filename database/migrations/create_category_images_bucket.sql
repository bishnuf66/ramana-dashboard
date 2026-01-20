-- Create storage bucket for category images
INSERT INTO storage.buckets (id, name, public)
VALUES ('category-images', 'category-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy for category images bucket
CREATE POLICY "Category images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'category-images');

CREATE POLICY "Anyone can upload category images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'category-images' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Anyone can update their own category images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'category-images' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Anyone can delete their own category images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'category-images' AND 
    auth.role() = 'authenticated'
  );
