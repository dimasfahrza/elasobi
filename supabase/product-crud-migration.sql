-- ============================================
-- PRODUCT CRUD MIGRATION
-- Run AFTER admin-migration.sql
-- Grants admins INSERT and DELETE on products
-- ============================================

-- Allow admins to insert new products
DROP POLICY IF EXISTS "Admin insert products" ON products;
CREATE POLICY "Admin insert products" ON products
  FOR INSERT WITH CHECK (public.is_admin());

-- Allow admins to delete products
DROP POLICY IF EXISTS "Admin delete products" ON products;
CREATE POLICY "Admin delete products" ON products
  FOR DELETE USING (public.is_admin());
