-- Allow admins to see all coupons (including inactive)
CREATE POLICY "Admin select all coupons" ON coupons FOR SELECT USING (is_admin());
CREATE POLICY "Admin insert coupons"     ON coupons FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admin update coupons"     ON coupons FOR UPDATE USING (is_admin());
CREATE POLICY "Admin delete coupons"     ON coupons FOR DELETE USING (is_admin());
