-- Create reviews table for product reviews and ratings
CREATE TABLE IF NOT EXISTS product_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  review_images TEXT[], -- Array of image URLs stored as JSON
  is_verified BOOLEAN DEFAULT FALSE,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one review per user per product
  UNIQUE(product_id, user_id)
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user_id ON product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_rating ON product_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_product_reviews_created_at ON product_reviews(created_at);

-- Enable RLS
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all reviews
CREATE POLICY "Public reviews are viewable by everyone" ON product_reviews
  FOR SELECT USING (true);

-- Policy: Authenticated users can insert reviews
CREATE POLICY "Authenticated users can insert reviews" ON product_reviews
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    user_id = auth.uid() AND
    rating >= 1 AND rating <= 5
  );

-- Policy: Users can update their own reviews
CREATE POLICY "Users can update own reviews" ON product_reviews
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND
    user_id = auth.uid()
  );

-- Policy: Users can delete their own reviews
CREATE POLICY "Users can delete own reviews" ON product_reviews
  FOR DELETE USING (
    auth.role() = 'authenticated' AND
    user_id = auth.uid()
  );

-- Function to update product average rating
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET 
    rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM product_reviews
      WHERE product_id = NEW.product_id
    ),
    updated_at = NOW()
  WHERE id = NEW.product_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update product rating when review is inserted or updated
CREATE TRIGGER update_product_rating_on_review_change
  AFTER INSERT OR UPDATE OR DELETE
  ON product_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_product_rating();

-- Function to update helpful count
CREATE OR REPLACE FUNCTION increment_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE product_reviews
  SET helpful_count = helpful_count + 1
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for helpful count (you'll need to add a helpful_votes table for this)
-- CREATE TRIGGER increment_helpful_count ON helpful_votes
--   AFTER INSERT OR UPDATE
--   FOR EACH ROW
--   EXECUTE FUNCTION increment_helpful_count();
