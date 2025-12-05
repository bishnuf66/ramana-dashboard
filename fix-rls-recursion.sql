-- Fix infinite recursion in admin_users RLS policies
-- Run this in your Supabase SQL Editor

-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Admins can view admin users" ON admin_users;
DROP POLICY IF EXISTS "Only admins can insert products" ON products;
DROP POLICY IF EXISTS "Only admins can update products" ON products;
DROP POLICY IF EXISTS "Only admins can delete products" ON products;
DROP POLICY IF EXISTS "Only admins can view orders" ON orders;
DROP POLICY IF EXISTS "Only admins can update orders" ON orders;

-- Create function to check if user is admin (bypasses RLS to avoid recursion)
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.id = user_id
  );
END;
$$;

-- RLS Policies for admin_users
-- Allow users to see their own record (to check if they're admin)
CREATE POLICY "Users can view their own admin record" ON admin_users
  FOR SELECT USING (id = auth.uid());

-- Allow admins to view all admin users (using the function to avoid recursion)
CREATE POLICY "Admins can view all admin users" ON admin_users
  FOR SELECT USING (is_admin(auth.uid()));

-- Allow users to insert their own admin record (for initial setup)
-- Note: For initial admin creation, use the Supabase dashboard with service role key
-- or temporarily disable RLS, insert the admin user, then re-enable RLS
CREATE POLICY "Users can insert their own admin record" ON admin_users
  FOR INSERT WITH CHECK (id = auth.uid());

-- RLS Policies for products (using the function)
CREATE POLICY "Only admins can insert products" ON products
  FOR INSERT WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Only admins can update products" ON products
  FOR UPDATE USING (is_admin(auth.uid()));

CREATE POLICY "Only admins can delete products" ON products
  FOR DELETE USING (is_admin(auth.uid()));

-- RLS Policies for orders (using the function)
CREATE POLICY "Only admins can view orders" ON orders
  FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Only admins can update orders" ON orders
  FOR UPDATE USING (is_admin(auth.uid()));

