-- Add category_id foreign key to products table
ALTER TABLE products 
ADD COLUMN category_id UUID REFERENCES categories(id) ON DELETE SET NULL;

-- Create index on category_id for faster lookups
CREATE INDEX IF NOT EXISTS products_category_id_idx ON products(category_id);

-- Update existing products to have category_id based on old category string
UPDATE products 
SET category_id = (
  SELECT id FROM categories 
  WHERE LOWER(categories.name) = LOWER(products.category)
  LIMIT 1
) 
WHERE category_id IS NULL;

-- Drop the old category column (after migrating data)
ALTER TABLE products DROP COLUMN category;

-- Note: Uncomment the above line after verifying data migration was successful
