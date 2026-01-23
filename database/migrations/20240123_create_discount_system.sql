-- Discount/Coupon System Schema
-- Create tables for managing discounts and coupon codes

-- Coupons table for storing discount codes
CREATE TABLE IF NOT EXISTS coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount', 'free_shipping')),
  discount_value DECIMAL(10,2) NOT NULL,
  minimum_order_amount DECIMAL(10,2) DEFAULT 0,
  usage_limit INTEGER DEFAULT NULL, -- NULL means unlimited
  usage_count INTEGER DEFAULT 0,
  first_time_only BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Coupon usage tracking
CREATE TABLE IF NOT EXISTS coupon_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  customer_email VARCHAR(255) NOT NULL,
  discount_amount DECIMAL(10,2) NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer discount tracking for first-time purchase discounts
CREATE TABLE IF NOT EXISTS customer_discounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_email VARCHAR(255) UNIQUE NOT NULL,
  first_purchase_completed BOOLEAN DEFAULT false,
  first_purchase_discount_applied BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default first-time user discount coupon
INSERT INTO coupons (
  code,
  description,
  discount_type,
  discount_value,
  minimum_order_amount,
  first_time_only,
  is_active,
  expires_at
) VALUES (
  'FIRST10',
  'First-time customer discount - 10% off your first order!',
  'percentage',
  10.00,
  0,
  true,
  true,
  NOW() + INTERVAL '1 year'
) ON CONFLICT (code) DO NOTHING;

-- Insert another first-time discount option
INSERT INTO coupons (
  code,
  description,
  discount_type,
  discount_value,
  minimum_order_amount,
  first_time_only,
  is_active,
  expires_at
) VALUES (
  'WELCOME15',
  'Welcome offer - 15% off for new customers!',
  'percentage',
  15.00,
  50.00,
  true,
  true,
  NOW() + INTERVAL '6 months'
) ON CONFLICT (code) DO NOTHING;

-- Insert a general discount for marketing
INSERT INTO coupons (
  code,
  description,
  discount_type,
  discount_value,
  minimum_order_amount,
  usage_limit,
  first_time_only,
  is_active,
  expires_at
) VALUES (
  'SAVE20',
  'Special offer - 20% off orders over $100',
  'percentage',
  20.00,
  100.00,
  100,
  false,
  true,
  NOW() + INTERVAL '3 months'
) ON CONFLICT (code) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_coupons_expires ON coupons(expires_at);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_customer ON coupon_usage(customer_email);
CREATE INDEX IF NOT EXISTS idx_customer_discounts_email ON customer_discounts(customer_email);

-- RLS policies for coupons
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_discounts ENABLE ROW LEVEL SECURITY;

-- Policy for coupons (read-only for public, full for authenticated)
CREATE POLICY "Public can view active coupons" ON coupons
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage coupons" ON coupons
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'authenticated'
  );

-- Policy for coupon usage
CREATE POLICY "Users can view their own coupon usage" ON coupon_usage
  FOR SELECT USING (customer_email = auth.jwt() ->> 'email');

CREATE POLICY "Admins can manage coupon usage" ON coupon_usage
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'authenticated'
  );

-- Policy for customer discounts
CREATE POLICY "Users can view their own discounts" ON customer_discounts
  FOR SELECT USING (customer_email = auth.jwt() ->> 'email');

CREATE POLICY "Admins can manage customer discounts" ON customer_discounts
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'authenticated'
  );

-- Function to validate and apply coupon
CREATE OR REPLACE FUNCTION validate_coupon(
  coupon_code VARCHAR(50),
  customer_email VARCHAR(255),
  order_total DECIMAL(10,2)
) RETURNS TABLE (
  valid BOOLEAN,
  discount_amount DECIMAL(10,2),
  message TEXT,
  coupon_id UUID
) AS $$
DECLARE
  coupon_record RECORD;
  customer_discount RECORD;
  is_first_time BOOLEAN := false;
BEGIN
  -- Get coupon details
  SELECT * INTO coupon_record 
  FROM coupons 
  WHERE code = UPPER(coupon_code) 
    AND is_active = true 
    AND (expires_at IS NULL OR expires_at > NOW());
  
  -- Check if coupon exists
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0, 'Invalid coupon code', NULL::UUID;
    RETURN;
  END IF;
  
  -- Check usage limit
  IF coupon_record.usage_limit IS NOT NULL AND coupon_record.usage_count >= coupon_record.usage_limit THEN
    RETURN QUERY SELECT false, 0, 'Coupon usage limit exceeded', coupon_record.id;
    RETURN;
  END IF;
  
  -- Check minimum order amount
  IF order_total < coupon_record.minimum_order_amount THEN
    RETURN QUERY SELECT false, 0, 
      'Minimum order amount of $' || coupon_record.minimum_order_amount || ' required', 
      coupon_record.id;
    RETURN;
  END IF;
  
  -- Check first-time only restriction
  IF coupon_record.first_time_only THEN
    -- Check if customer has used this coupon before
    SELECT * INTO customer_discount 
    FROM customer_discounts 
    WHERE customer_email = customer_email;
    
    IF customer_discount.first_purchase_completed THEN
      RETURN QUERY SELECT false, 0, 'This coupon is for first-time customers only', coupon_record.id;
      RETURN;
    END IF;
    
    is_first_time := true;
  END IF;
  
  -- Calculate discount amount
  DECLARE
    calculated_discount DECIMAL(10,2) := 0;
  BEGIN
    IF coupon_record.discount_type = 'percentage' THEN
      calculated_discount := order_total * (coupon_record.discount_value / 100);
    ELSIF coupon_record.discount_type = 'fixed_amount' THEN
      calculated_discount := LEAST(coupon_record.discount_value, order_total);
    ELSIF coupon_record.discount_type = 'free_shipping' THEN
      -- For free shipping, you might want to calculate shipping cost separately
      calculated_discount := 0; -- This would be handled in shipping calculation
    END IF;
  END;
  
  -- Return success with discount amount
  RETURN QUERY SELECT true, calculated_discount, 'Coupon applied successfully', coupon_record.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to apply coupon after order completion
CREATE OR REPLACE FUNCTION apply_coupon_usage(
  coupon_id UUID,
  customer_email VARCHAR(255),
  order_id UUID,
  discount_amount DECIMAL(10,2)
) RETURNS BOOLEAN AS $$
BEGIN
  -- Record coupon usage
  INSERT INTO coupon_usage (coupon_id, order_id, customer_email, discount_amount)
  VALUES (coupon_id, order_id, customer_email, discount_amount);
  
  -- Update coupon usage count
  UPDATE coupons 
  SET usage_count = usage_count + 1 
  WHERE id = coupon_id;
  
  -- Update customer discount status
  INSERT INTO customer_discounts (customer_email, first_purchase_completed, first_purchase_discount_applied)
  VALUES (customer_email, true, true)
  ON CONFLICT (customer_email) 
  DO UPDATE SET 
    first_purchase_completed = true,
    first_purchase_discount_applied = true,
    updated_at = NOW();
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
