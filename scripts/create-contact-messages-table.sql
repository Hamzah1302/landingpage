-- =====================================================
-- CONTACT MESSAGES TABLE
-- =====================================================
-- Stores all submissions from the "Send us a Message" form
-- on the public homepage.

CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL,
  company VARCHAR(200),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for sorting newest-first in the admin
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at
  ON contact_messages (created_at DESC);

-- Index for filtering unread messages
CREATE INDEX IF NOT EXISTS idx_contact_messages_is_read
  ON contact_messages (is_read);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Clean up any old policies on re-run
DROP POLICY IF EXISTS "Anyone can submit contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Authenticated users can view all messages" ON contact_messages;
DROP POLICY IF EXISTS "Authenticated users can update messages" ON contact_messages;
DROP POLICY IF EXISTS "Authenticated users can delete messages" ON contact_messages;

-- PUBLIC: Anyone (including anon) can INSERT a new message.
-- This is how the homepage contact form works without requiring login.
CREATE POLICY "Anyone can submit contact messages"
  ON contact_messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- AUTHENTICATED ADMIN: can read every message.
CREATE POLICY "Authenticated users can view all messages"
  ON contact_messages
  FOR SELECT
  TO authenticated
  USING (true);

-- AUTHENTICATED ADMIN: can mark as read / unread.
CREATE POLICY "Authenticated users can update messages"
  ON contact_messages
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- AUTHENTICATED ADMIN: can delete spam/old messages.
CREATE POLICY "Authenticated users can delete messages"
  ON contact_messages
  FOR DELETE
  TO authenticated
  USING (true);
