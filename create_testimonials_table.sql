-- Create testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255),
  content TEXT NOT NULL,
  image VARCHAR(500),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on status for faster queries
CREATE INDEX IF NOT EXISTS idx_testimonials_status ON testimonials(status);

-- Enable Row Level Security (RLS)
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users (adjust as needed for your auth setup)
-- For admin access
CREATE POLICY "Allow all operations for authenticated users" ON testimonials
  FOR ALL USING (auth.role() = 'authenticated');

-- Or if you have specific roles, adjust accordingly
-- CREATE POLICY "Allow read for everyone" ON testimonials FOR SELECT USING (true);
-- CREATE POLICY "Allow insert/update/delete for admins" ON testimonials FOR ALL USING (auth.jwt() ->> 'role' = 'admin');