-- Add product-specific coupon support
-- This migration extends the existing discount system to support coupons that apply only to specific products

-- Create junction table for coupon-product relationships
CREATE TABLE IF NOT EXISTS coupon_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique coupon-product combinations
  UNIQUE(coupon_id, product_id)
);

-- Add column to coupons table to indicate if coupon is product-specific
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS is_product_specific BOOLEAN DEFAULT false;

-- Add column to track which products are included/excluded
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS product_inclusion_type VARCHAR(20) DEFAULT 'include' CHECK (product_inclusion_type IN ('include', 'exclude'));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_coupon_products_coupon_id ON coupon_products(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_products_product_id ON coupon_products(product_id);
CREATE INDEX IF NOT EXISTS idx_coupons_product_specific ON coupons(is_product_specific);

-- RLS policy for coupon_products
ALTER TABLE coupon_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view coupon products" ON coupon_products
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage coupon products" ON coupon_products
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'authenticated'
  );

-- Update the validate_coupon function to handle product-specific coupons
CREATE OR REPLACE FUNCTION validate_coupon(
  coupon_code VARCHAR(50),
  customer_email VARCHAR(255),
  order_total DECIMAL(10,2),
  product_ids UUID[] DEFAULT NULL
) RETURNS TABLE (
  valid BOOLEAN,
  discount_amount DECIMAL(10,2),
  message TEXT,
  coupon_id UUID,
  applicable_products UUID[]
) AS $$
DECLARE
  coupon_record RECORD;
  customer_discount RECORD;
  is_first_time BOOLEAN := false;
  applicable_product_ids UUID[] := ARRAY[]::UUID[];
  coupon_product_ids UUID[] := ARRAY[]::UUID[];
BEGIN
  -- Get coupon details
  SELECT * INTO coupon_record 
  FROM coupons 
  WHERE code = UPPER(coupon_code) 
    AND is_active = true 
    AND (expires_at IS NULL OR expires_at > NOW());
  
  -- Check if coupon exists
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0, 'Invalid coupon code', NULL::UUID, ARRAY[]::UUID[];
    RETURN;
  END IF;
  
  -- Check usage limit
  IF coupon_record.usage_limit IS NOT NULL AND coupon_record.usage_count >= coupon_record.usage_limit THEN
    RETURN QUERY SELECT false, 0, 'Coupon usage limit exceeded', coupon_record.id, ARRAY[]::UUID[];
    RETURN;
  END IF;
  
  -- Check minimum order amount
  IF order_total < coupon_record.minimum_order_amount THEN
    RETURN QUERY SELECT false, 0, 
      'Minimum order amount of $' || coupon_record.minimum_order_amount || ' required', 
      coupon_record.id, ARRAY[]::UUID[];
    RETURN;
  END IF;
  
  -- Check first-time only restriction
  IF coupon_record.first_time_only THEN
    -- Check if customer has used this coupon before
    SELECT * INTO customer_discount 
    FROM customer_discounts 
    WHERE customer_email = customer_email;
    
    IF customer_discount.first_purchase_completed THEN
      RETURN QUERY SELECT false, 0, 'This coupon is for first-time customers only', coupon_record.id, ARRAY[]::UUID[];
      RETURN;
    END IF;
    
    is_first_time := true;
  END IF;
  
  -- Handle product-specific coupons
  IF coupon_record.is_product_specific THEN
    -- Get products associated with this coupon
    SELECT ARRAY_AGG(product_id) INTO coupon_product_ids
    FROM coupon_products 
    WHERE coupon_id = coupon_record.id;
    
    -- If no products provided in validation, return invalid
    IF product_ids IS NULL OR array_length(product_ids, 1) = 0 THEN
      RETURN QUERY SELECT false, 0, 'This coupon applies to specific products only', coupon_record.id, ARRAY[]::UUID[];
      RETURN;
    END IF;
    
    -- Check product inclusion/exclusion
    IF coupon_record.product_inclusion_type = 'include' THEN
      -- Coupon applies only to specified products
      SELECT ARRAY(SELECT UNNEST(product_ids) INTERSECT SELECT UNNEST(coupon_product_ids)) INTO applicable_product_ids;
      
      IF array_length(applicable_product_ids, 1) = 0 THEN
        RETURN QUERY SELECT false, 0, 'This coupon is not applicable to any products in your cart', coupon_record.id, coupon_product_ids;
        RETURN;
      END IF;
    ELSE
      -- Coupon excludes specified products (applies to all others)
      SELECT ARRAY(SELECT UNNEST(product_ids) EXCEPT SELECT UNNEST(coupon_product_ids)) INTO applicable_product_ids;
      
      IF array_length(applicable_product_ids, 1) = 0 THEN
        RETURN QUERY SELECT false, 0, 'This coupon cannot be applied to products in your cart', coupon_record.id, coupon_product_ids;
        RETURN;
      END IF;
    END IF;
  ELSE
    -- Non-product-specific coupon applies to all products
    IF product_ids IS NOT NULL THEN
      applicable_product_ids := product_ids;
    END IF;
  END IF;
  
  -- Calculate discount amount
  DECLARE
    calculated_discount DECIMAL(10,2) := 0;
    applicable_total DECIMAL(10,2) := order_total;
  BEGIN
    IF coupon_record.discount_type = 'percentage' THEN
      calculated_discount := applicable_total * (coupon_record.discount_value / 100);
    ELSIF coupon_record.discount_type = 'fixed_amount' THEN
      calculated_discount := LEAST(coupon_record.discount_value, applicable_total);
    ELSIF coupon_record.discount_type = 'free_shipping' THEN
      -- For free shipping, you might want to calculate shipping cost separately
      calculated_discount := 0; -- This would be handled in shipping calculation
    END IF;
  END;
  
  -- Return success with discount amount and applicable products
  RETURN QUERY SELECT true, calculated_discount, 'Coupon applied successfully', coupon_record.id, applicable_product_ids;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get applicable coupons for a cart
CREATE OR REPLACE FUNCTION get_applicable_coupons(
  customer_email VARCHAR(255),
  product_ids UUID[] DEFAULT NULL,
  order_total DECIMAL(10,2)
) RETURNS TABLE (
  coupon_id UUID,
  code VARCHAR(50),
  description TEXT,
  discount_type VARCHAR(20),
  discount_value DECIMAL(10,2),
  discount_amount DECIMAL(10,2),
  is_applicable BOOLEAN,
  message TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.code,
    c.description,
    c.discount_type,
    c.discount_value,
    0 as discount_amount, -- Will be calculated by validate_coupon
    false as is_applicable, -- Will be determined by validation
    '' as message
  FROM coupons c
  WHERE c.is_active = true 
    AND (c.expires_at IS NULL OR c.expires_at > NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert some example product-specific coupons
-- First, let's create coupons for specific products (you'll need to replace the product_ids with actual product IDs from your database)

-- Example: 25% off on specific product
INSERT INTO coupons (
  code,
  description,
  discount_type,
  discount_value,
  minimum_order_amount,
  first_time_only,
  is_active,
  is_product_specific,
  product_inclusion_type,
  expires_at
) VALUES (
  'PRODUCT25',
  '25% off on selected products!',
  'percentage',
  25.00,
  0,
  false,
  true,
  true,
  'include',
  NOW() + INTERVAL '3 months'
) ON CONFLICT (code) DO NOTHING;

-- Example: $10 off on specific products, minimum order $50
INSERT INTO coupons (
  code,
  description,
  discount_type,
  discount_value,
  minimum_order_amount,
  first_time_only,
  is_active,
  is_product_specific,
  product_inclusion_type,
  expires_at
) VALUES (
  'SPECIAL10',
  '$10 off on selected products - Min order $50',
  'fixed_amount',
  10.00,
  50.00,
  false,
  true,
  true,
  'include',
  NOW() + INTERVAL '2 months'
) ON CONFLICT (code) DO NOTHING;

-- Example: Exclude certain products from a general discount
INSERT INTO coupons (
  code,
  description,
  discount_type,
  discount_value,
  minimum_order_amount,
  first_time_only,
  is_active,
  is_product_specific,
  product_inclusion_type,
  expires_at
) VALUES (
  'EXCLUDE15',
  '15% off - Excludes clearance items',
  'percentage',
  15.00,
  25.00,
  false,
  true,
  true,
  'exclude',
  NOW() + INTERVAL '4 months'
) ON CONFLICT (code) DO NOTHING;

-- Comment: You'll need to manually add product associations after creating products
-- Example: INSERT INTO coupon_products (coupon_id, product_id) VALUES 
--   ((SELECT id FROM coupons WHERE code = 'PRODUCT25'), 'your-product-uuid-here');
