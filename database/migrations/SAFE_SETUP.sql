-- SAFE DISCOUNT SYSTEM SETUP (Handles Existing Policies)
-- Run this if you get "already exists" errors

-- Step 1: Create tables (IF NOT EXISTS prevents errors)
CREATE TABLE IF NOT EXISTS coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount', 'free_shipping')),
  discount_value DECIMAL(10,2) NOT NULL,
  minimum_order_amount DECIMAL(10,2) DEFAULT 0,
  usage_limit INTEGER DEFAULT NULL,
  usage_count INTEGER DEFAULT 0,
  first_time_only BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_product_specific BOOLEAN DEFAULT false,
  product_inclusion_type VARCHAR(20) DEFAULT 'include' CHECK (product_inclusion_type IN ('include', 'exclude'))
);

CREATE TABLE IF NOT EXISTS coupon_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  customer_email VARCHAR(255) NOT NULL,
  discount_amount DECIMAL(10,2) NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customer_discounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_email VARCHAR(255) UNIQUE NOT NULL,
  first_purchase_completed BOOLEAN DEFAULT false,
  first_purchase_discount_applied BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS coupon_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(coupon_id, product_id)
);

-- Step 2: Add missing columns (IF NOT EXISTS prevents errors)
DO $$
BEGIN
  -- Add product-specific columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'coupons' AND column_name = 'is_product_specific') THEN
    ALTER TABLE coupons ADD COLUMN is_product_specific BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'coupons' AND column_name = 'product_inclusion_type') THEN
    ALTER TABLE coupons ADD COLUMN product_inclusion_type VARCHAR(20) DEFAULT 'include' CHECK (product_inclusion_type IN ('include', 'exclude'));
  END IF;
END $$;

-- Step 3: Create indexes (IF NOT EXISTS prevents errors)
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_coupons_expires ON coupons(expires_at);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_customer ON coupon_usage(customer_email);
CREATE INDEX IF NOT EXISTS idx_customer_discounts_email ON customer_discounts(customer_email);
CREATE INDEX IF NOT EXISTS idx_coupon_products_coupon_id ON coupon_products(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_products_product_id ON coupon_products(product_id);
CREATE INDEX IF NOT EXISTS idx_coupons_product_specific ON coupons(is_product_specific);

-- Step 4: Enable Row Level Security (safe to run multiple times)
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_products ENABLE ROW LEVEL SECURITY;

-- Step 5: Drop existing policies if they exist, then create new ones
DROP POLICY IF EXISTS "Public can view active coupons" ON coupons;
DROP POLICY IF EXISTS "Admins can manage coupons" ON coupons;
DROP POLICY IF EXISTS "Users can view their own coupon usage" ON coupon_usage;
DROP POLICY IF EXISTS "Admins can manage coupon usage" ON coupon_usage;
DROP POLICY IF EXISTS "Public can view coupon products" ON coupon_products;
DROP POLICY IF EXISTS "Admins can manage coupon products" ON coupon_products;

-- Create RLS policies
CREATE POLICY "Public can view active coupons" ON coupons
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage coupons" ON coupons
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'authenticated'
  );

CREATE POLICY "Users can view their own coupon usage" ON coupon_usage
  FOR SELECT USING (customer_email = auth.jwt() ->> 'email');

CREATE POLICY "Admins can manage coupon usage" ON coupon_usage
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'authenticated'
  );

CREATE POLICY "Public can view coupon products" ON coupon_products
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage coupon products" ON coupon_products
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'authenticated'
  );

-- Step 6: Create or replace functions (safe to run multiple times)
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
      calculated_discount := 0; -- This would be handled in shipping calculation
    END IF;
  END;
  
  -- Return success with discount amount and applicable products
  RETURN QUERY SELECT true, calculated_discount, 'Coupon applied successfully', coupon_record.id, applicable_product_ids;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION apply_coupon_usage(
  coupon_id UUID,
  customer_email VARCHAR(255),
  order_id UUID,
  discount_amount DECIMAL(10,2)
) RETURNS BOOLEAN AS $$
BEGIN
  -- Record coupon usage
  INSERT INTO coupon_usage (coupon_id, customer_email, order_id, discount_amount)
  VALUES (coupon_id, customer_email, order_id, discount_amount);
  
  -- Increment coupon usage count
  UPDATE coupons 
  SET usage_count = usage_count + 1 
  WHERE id = coupon_id;
  
  -- Mark customer as having completed first purchase if applicable
  UPDATE customer_discounts 
  SET 
    first_purchase_completed = true,
    first_purchase_discount_applied = true,
    updated_at = NOW()
  WHERE customer_email = customer_email;
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error applying coupon usage: %', SQLERRM;
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Insert sample coupons (ON CONFLICT prevents duplicates)
INSERT INTO coupons (
  code, description, discount_type, discount_value, 
  minimum_order_amount, first_time_only, is_active, expires_at
) VALUES 
  ('FIRST10', '10% off for first-time customers!', 'percentage', 10.00, 0, true, true, NOW() + INTERVAL '1 year'),
  ('WELCOME15', '15% off for new customers over $50', 'percentage', 15.00, 50.00, true, true, NOW() + INTERVAL '6 months'),
  ('SAVE20', '20% off orders over $100', 'percentage', 20.00, 100.00, false, true, NOW() + INTERVAL '3 months')
ON CONFLICT (code) DO NOTHING;

-- Insert product-specific coupons
INSERT INTO coupons (
  code, description, discount_type, discount_value,
  minimum_order_amount, first_time_only, is_active, is_product_specific,
  product_inclusion_type, expires_at
) VALUES 
  ('PRODUCT25', '25% off on selected products!', 'percentage', 25.00, 0, false, true, true, 'include', NOW() + INTERVAL '3 months'),
  ('SPECIAL10', '$10 off on selected products - Min order $50', 'fixed_amount', 10.00, 50.00, false, true, true, 'include', NOW() + INTERVAL '2 months'),
  ('EXCLUDE15', '15% off - Excludes clearance items', 'percentage', 15.00, 25.00, false, true, true, 'exclude', NOW() + INTERVAL '4 months')
ON CONFLICT (code) DO NOTHING;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Discount system setup completed successfully!';
  RAISE NOTICE '📋 Next steps:';
  RAISE NOTICE '1. Run: npx supabase gen types types/database.types.ts';
  RAISE NOTICE '2. Restart your development server';
  RAISE NOTICE '3. TypeScript errors should now be resolved';
END $$;
