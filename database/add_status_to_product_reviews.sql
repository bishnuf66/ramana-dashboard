-- Add status column to product_reviews table if it doesn't exist
ALTER TABLE public.product_reviews 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected'));

-- Update existing reviews to have 'approved' status by default
UPDATE public.product_reviews 
SET status = 'approved' 
WHERE status IS NULL;

-- Add index for better performance on status filtering
CREATE INDEX IF NOT EXISTS idx_product_reviews_status ON public.product_reviews(status);

-- Add RLS policy for status updates if RLS is enabled
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can update status
CREATE POLICY "Admins can update review status" ON public.product_reviews
    FOR UPDATE USING (
      EXISTS (
        SELECT 1 FROM public.auth.users 
        WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'
      )
    );

-- Policy: Users can update their own reviews' status
CREATE POLICY "Users can update own review status" ON public.product_reviews
    FOR UPDATE USING (
      auth.uid() = user_id
    );

-- Grant permissions
GRANT ALL ON public.product_reviews TO authenticated;
GRANT SELECT ON public.product_reviews TO anon;
