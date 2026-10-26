-- Create articles table
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

-- Create RLS policies
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read published articles
CREATE POLICY "Anyone can view published articles" ON articles
  FOR SELECT USING (is_published = true);

-- Policy: Authenticated users can read all articles
CREATE POLICY "Authenticated users can view all articles" ON articles
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Authenticated users can insert articles
CREATE POLICY "Authenticated users can insert articles" ON articles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy: Authenticated users can update articles
CREATE POLICY "Authenticated users can update articles" ON articles
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Policy: Authenticated users can delete articles
CREATE POLICY "Authenticated users can delete articles" ON articles
  FOR DELETE USING (auth.role() = 'authenticated');

-- Reuse or create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample articles
INSERT INTO articles (title, slug, excerpt, content, category, author, is_published, published_at) VALUES
(
  'Building a Bridge Between the Netherlands and Indonesia',
  'building-a-bridge-netherlands-indonesia',
  'How Hitopia is connecting top Indonesian talent with Dutch companies, creating opportunities across borders and transforming the global staffing landscape.',
  '<p>In an increasingly interconnected world, the demand for skilled talent transcends geographic boundaries. Hitopia was founded on a simple yet powerful premise: that some of the world best engineers, developers, and professionals are based in Indonesia, and companies in the Netherlands deserve access to that talent pool.</p><p>Over the past few years, we have placed hundreds of top-tier professionals from Indonesia into Dutch companies, spanning industries from fintech and e-commerce to manufacturing and healthcare. Our model is built on trust, transparency, and a deep commitment to both our clients and our talent.</p><h2>Why Indonesia?</h2><p>Indonesia boasts a rapidly growing tech ecosystem, world-class universities producing thousands of graduates annually, and a workforce that combines technical excellence with strong work ethic and adaptability. Cities like Bandung, Jakarta, and Yogyakarta have become hotbeds of engineering talent.</p><h2>The Hitopia Difference</h2><p>We do not just match resumes to job descriptions. We conduct rigorous technical assessments, cultural fit evaluations, and soft-skills training to ensure every talent we place is fully prepared for success in a Dutch work environment. Our dedicated account managers provide ongoing support to both clients and talent throughout the engagement.</p>',
  'Company Story',
  'Hitopia Team',
  true,
  NOW() - INTERVAL '10 days'
),
(
  'The Rise of On-Demand Staffing in 2025',
  'rise-of-on-demand-staffing-2025',
  'The global staffing industry is undergoing a fundamental transformation. Explore the key trends driving the shift toward on-demand talent models and what it means for businesses.',
  '<p>The traditional model of full-time, permanent employment is giving way to a more flexible, project-based approach to talent acquisition. Companies are increasingly turning to on-demand staffing partners to access specialized skills quickly, scale their teams up or down based on project needs, and reduce overhead costs.</p><p>According to recent industry data, the global contingent workforce market is expected to exceed $500 billion by 2026. This growth is driven by several converging factors.</p><h2>Key Drivers of Growth</h2><p>First, digital transformation initiatives are accelerating across all industries, creating urgent demand for specialized tech skills that traditional hiring pipelines cannot fulfill quickly enough. Second, the normalization of remote work has expanded the geographic talent pool available to any given company. Third, economic uncertainty has made companies more cautious about permanent headcount expansion.</p><h2>What This Means for Your Business</h2><p>If you are a growing company looking to scale engineering capacity, launch a new product, or modernize legacy systems, on-demand staffing may be the most efficient and cost-effective path forward. Hitopia specializes in helping businesses navigate this transition.</p>',
  'Industry Insight',
  'Hitopia Team',
  true,
  NOW() - INTERVAL '5 days'
),
(
  'How to Evaluate an Outsourcing Partner: A Practical Guide',
  'how-to-evaluate-outsourcing-partner',
  'Choosing the right outsourcing partner is one of the most critical decisions a growing business can make. Here is a practical framework to help you evaluate your options.',
  '<p>Not all outsourcing partners are created equal. The difference between a great partner and a poor one can mean the difference between a project that accelerates your business and one that sets you back months. Here is what to look for.</p><h2>1. Talent Quality and Vetting Process</h2><p>Ask any prospective partner to walk you through their talent acquisition and vetting process in detail. How do they source candidates? What technical assessments do they use? What is their acceptance rate? A rigorous process is a strong signal of quality.</p><h2>2. Communication and Account Management</h2><p>Outsourcing only works when communication is seamless. Look for a partner with dedicated account managers, clear escalation paths, and a track record of proactive communication.</p><h2>3. Cultural Alignment</h2><p>Technical skills are table stakes. The best outsourcing partners also evaluate soft skills, communication styles, and cultural fit to ensure their talent can integrate smoothly into your team.</p><h2>4. References and Track Record</h2><p>Always ask for client references and case studies. Look for partners with proven experience in your industry and with companies of a similar size and complexity.</p>',
  'Tips & Guides',
  'Hitopia Team',
  true,
  NOW() - INTERVAL '2 days'
);
