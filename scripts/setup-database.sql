-- ============================================================
-- HITOPIA CMS - Full Database Setup Script
-- Run this entire script in Supabase SQL Editor
-- ============================================================

-- ============================================================
-- JOBS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  department VARCHAR(100) NOT NULL,
  location VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'Full-time',
  description TEXT NOT NULL,
  requirements TEXT[] DEFAULT '{}',
  responsibilities TEXT[] DEFAULT '{}',
  benefits TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist (prevents conflicts on re-run)
DROP POLICY IF EXISTS "Anyone can view active jobs" ON jobs;
DROP POLICY IF EXISTS "Authenticated users can view all jobs" ON jobs;
DROP POLICY IF EXISTS "Authenticated users can insert jobs" ON jobs;
DROP POLICY IF EXISTS "Authenticated users can update jobs" ON jobs;
DROP POLICY IF EXISTS "Authenticated users can delete jobs" ON jobs;

-- Public: anyone can read active jobs
CREATE POLICY "Anyone can view active jobs" ON jobs
  FOR SELECT USING (is_active = true);

-- Authenticated: full read access (including inactive)
CREATE POLICY "Authenticated users can view all jobs" ON jobs
  FOR SELECT TO authenticated USING (true);

-- Authenticated: insert
CREATE POLICY "Authenticated users can insert jobs" ON jobs
  FOR INSERT TO authenticated WITH CHECK (true);

-- Authenticated: update
CREATE POLICY "Authenticated users can update jobs" ON jobs
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Authenticated: delete
CREATE POLICY "Authenticated users can delete jobs" ON jobs
  FOR DELETE TO authenticated USING (true);

-- ============================================================
-- ARTICLES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100) NOT NULL DEFAULT 'Insight',
  author VARCHAR(100) NOT NULL DEFAULT 'Hitopia Team',
  cover_image_url TEXT,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist (prevents conflicts on re-run)
DROP POLICY IF EXISTS "Anyone can view published articles" ON articles;
DROP POLICY IF EXISTS "Authenticated users can view all articles" ON articles;
DROP POLICY IF EXISTS "Authenticated users can insert articles" ON articles;
DROP POLICY IF EXISTS "Authenticated users can update articles" ON articles;
DROP POLICY IF EXISTS "Authenticated users can delete articles" ON articles;

-- Public: anyone can read published articles
CREATE POLICY "Anyone can view published articles" ON articles
  FOR SELECT USING (is_published = true);

-- Authenticated: full read access (including drafts)
CREATE POLICY "Authenticated users can view all articles" ON articles
  FOR SELECT TO authenticated USING (true);

-- Authenticated: insert
CREATE POLICY "Authenticated users can insert articles" ON articles
  FOR INSERT TO authenticated WITH CHECK (true);

-- Authenticated: update (this is the key one for publishing)
CREATE POLICY "Authenticated users can update articles" ON articles
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Authenticated: delete
CREATE POLICY "Authenticated users can delete articles" ON articles
  FOR DELETE TO authenticated USING (true);

-- ============================================================
-- TRIGGERS: auto-update updated_at on row changes
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_jobs_updated_at ON jobs;
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_articles_updated_at ON articles;
CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- DONE
-- Both tables are ready with correct RLS policies.
-- ============================================================
