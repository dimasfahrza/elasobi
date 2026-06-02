-- Settings table for admin-configurable values
CREATE TABLE IF NOT EXISTS settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read settings"  ON settings FOR SELECT USING (true);
CREATE POLICY "Admin write settings"  ON settings FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admin update settings" ON settings FOR UPDATE USING (is_admin());

-- Default offer end date: 30 days from now
INSERT INTO settings (key, value)
VALUES ('offer_end_date', (NOW() + INTERVAL '30 days')::TEXT)
ON CONFLICT (key) DO NOTHING;
