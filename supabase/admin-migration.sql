-- ============================================
-- ELASOBI ADMIN MIGRATION
-- Run this AFTER schema.sql and seed.sql
-- ============================================

-- 1. Add role column to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'customer';

-- 2. Create refunds table
CREATE TABLE IF NOT EXISTS refunds (
  id         BIGSERIAL PRIMARY KEY,
  order_id   BIGINT REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  amount     NUMERIC(10, 2) NOT NULL,
  reason     TEXT,
  status     TEXT NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending', 'processed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;

-- 3. is_admin() helper - SECURITY DEFINER so it can read profiles
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 4. Admin RLS policies
-- Drop existing admin policies first (idempotent re-run)
DROP POLICY IF EXISTS "Admin update products"        ON products;
DROP POLICY IF EXISTS "Admin view all orders"        ON orders;
DROP POLICY IF EXISTS "Admin update orders"          ON orders;
DROP POLICY IF EXISTS "Admin view all order_items"   ON order_items;
DROP POLICY IF EXISTS "Admin view all profiles"      ON profiles;
DROP POLICY IF EXISTS "Admin manage refunds"         ON refunds;

CREATE POLICY "Admin update products" ON products
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admin view all orders" ON orders
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admin update orders" ON orders
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admin view all order_items" ON order_items
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admin view all profiles" ON profiles
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admin manage refunds" ON refunds
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 5. Promote admin user
-- IMPORTANT: First go to Supabase Authentication > Users > "Add user"
-- Create: admin@elasobi.com / admin123 (check "Auto Confirm User")
-- Then run THIS to give them admin role:

UPDATE profiles
  SET role = 'admin', full_name = 'Elasobi Admin'
  WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@elasobi.com');

-- If the row didn't exist (trigger didn't fire), insert it:
INSERT INTO profiles (id, full_name, role)
  SELECT id, 'Elasobi Admin', 'admin'
  FROM auth.users
  WHERE email = 'admin@elasobi.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin', full_name = 'Elasobi Admin';
