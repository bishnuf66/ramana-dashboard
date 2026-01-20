-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  picture TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on slug for faster lookups
CREATE INDEX IF NOT EXISTS categories_slug_idx ON categories(slug);

-- Create index on name for search functionality
CREATE INDEX IF NOT EXISTS categories_name_idx ON categories(name);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_categories_updated_at 
  BEFORE UPDATE ON categories 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users (admin access)
CREATE POLICY "Admins can do all operations on categories" ON categories
  FOR ALL USING (
    auth.role() = 'authenticated'
  );

-- Insert some sample categories (optional)
INSERT INTO categories (name, slug, picture) VALUES
('Flowers', 'flowers', 'https://images.unsplash.com/photo-1560419015-9c527feb5974?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'),
('Accessories', 'accessories', 'https://images.unsplash.com/photo-1594634319159-ec20e1638b39?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'),
('Fruits', 'fruits', 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80')
ON CONFLICT (slug) DO NOTHING;
