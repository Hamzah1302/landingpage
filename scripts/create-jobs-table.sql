-- Create jobs table
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

-- Create RLS policies
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active jobs
CREATE POLICY "Anyone can view active jobs" ON jobs
  FOR SELECT USING (is_active = true);

-- Policy: Authenticated users can read all jobs
CREATE POLICY "Authenticated users can view all jobs" ON jobs
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Authenticated users can insert jobs
CREATE POLICY "Authenticated users can insert jobs" ON jobs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy: Authenticated users can update jobs
CREATE POLICY "Authenticated users can update jobs" ON jobs
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Policy: Authenticated users can delete jobs
CREATE POLICY "Authenticated users can delete jobs" ON jobs
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO jobs (title, department, location, type, description, requirements, responsibilities, benefits, is_active) VALUES
(
  'Senior Full-Stack Developer (Remote)',
  'Engineering',
  'Remote (Global)',
  'Full-time',
  'We are looking for an experienced Full-Stack Developer to join our remote team and help build innovative solutions for our clients.',
  ARRAY[
    '5+ years of experience in full-stack development',
    'Proficiency in React, Node.js, and TypeScript',
    'Experience with cloud platforms (AWS, GCP, or Azure)',
    'Strong problem-solving and communication skills'
  ],
  ARRAY[
    'Develop and maintain web applications',
    'Collaborate with cross-functional teams',
    'Write clean, maintainable code',
    'Participate in code reviews and technical discussions'
  ],
  ARRAY[
    'Competitive salary',
    'Remote work flexibility',
    'Professional development opportunities',
    'Health insurance coverage'
  ],
  true
),
(
  'Technical Recruiter',
  'Human Resources',
  'Bandung, Indonesia / Remote',
  'Full-time',
  'Join our HR team as a Technical Recruiter and help us find the best talent in the industry.',
  ARRAY[
    '3+ years of technical recruiting experience',
    'Understanding of software development roles',
    'Excellent communication and interpersonal skills',
    'Experience with recruiting tools and platforms'
  ],
  ARRAY[
    'Source and screen technical candidates',
    'Conduct initial interviews',
    'Manage candidate pipeline',
    'Collaborate with hiring managers'
  ],
  ARRAY[
    'Competitive salary and bonuses',
    'Flexible working arrangements',
    'Career growth opportunities',
    'Comprehensive benefits package'
  ],
  true
);
