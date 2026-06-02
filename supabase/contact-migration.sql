-- =====================================================
--  CONTACT MESSAGES
--  Run this in your Supabase SQL Editor
-- =====================================================

CREATE TABLE IF NOT EXISTS contact_messages (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  subject     TEXT,
  message     TEXT NOT NULL,
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Anyone (including guests) can submit a message
CREATE POLICY "anyone_can_insert_contact"
  ON contact_messages FOR INSERT
  WITH CHECK (true);

-- Only admins can read messages
CREATE POLICY "admins_can_read_contact"
  ON contact_messages FOR SELECT
  USING (is_admin());

-- Only admins can mark messages as read
CREATE POLICY "admins_can_update_contact"
  ON contact_messages FOR UPDATE
  USING (is_admin());
