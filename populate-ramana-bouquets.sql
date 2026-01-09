-- Populate database with handmade bouquet categories, subcategories, and products for Ramana
-- Contact: 98192747199, ramanatheeng65@gmail.com, ramana.com.np

-- Insert Categories for Handmade Bouquets
INSERT INTO categories (name, slug, description, is_active, sort_order) VALUES
('Handmade Bouquets', 'handmade-bouquets', 'Beautiful handcrafted bouquets made with love by Ramana. Each arrangement is uniquely designed for your special moments.', true, 1),
('Seasonal Collections', 'seasonal-collections', 'Seasonal flower arrangements featuring the freshest blooms of each season, handpicked and arranged by Ramana.', true, 2),
('Special Occasions', 'special-occasions', 'Custom handmade bouquets designed for life''s most precious moments - weddings, anniversaries, birthdays, and celebrations.', true, 3);

-- Insert Subcategories
INSERT INTO subcategories (category_id, name, slug, description, is_active, sort_order) VALUES
-- Handmade Bouquets subcategories
((SELECT id FROM categories WHERE slug = 'handmade-bouquets'), 'Rose Bouquets', 'rose-bouquets', 'Elegant handmade rose arrangements in various colors and styles', true, 1),
((SELECT id FROM categories WHERE slug = 'handmade-bouquets'), 'Mixed Flower Bouquets', 'mixed-flower-bouquets', 'Beautiful combinations of different flowers crafted into stunning arrangements', true, 2),
((SELECT id FROM categories WHERE slug = 'handmade-bouquets'), 'Lily Arrangements', 'lily-arrangements', 'Graceful lily bouquets handcrafted for elegance and beauty', true, 3),
((SELECT id FROM categories WHERE slug = 'handmade-bouquets'), 'Carnation Collections', 'carnation-collections', 'Charming carnation bouquets in vibrant colors, perfect for any occasion', true, 4),

-- Seasonal Collections subcategories
((SELECT id FROM categories WHERE slug = 'seasonal-collections'), 'Spring Blooms', 'spring-blooms', 'Fresh spring flowers celebrating new beginnings and renewal', true, 1),
((SELECT id FROM categories WHERE slug = 'seasonal-collections'), 'Summer Vibrance', 'summer-vibrance', 'Bright and colorful summer flower arrangements full of energy', true, 2),
((SELECT id FROM categories WHERE slug = 'seasonal-collections'), 'Autumn Warmth', 'autumn-warmth', 'Warm-toned autumn arrangements with rich, deep colors', true, 3),
((SELECT id FROM categories WHERE slug = 'seasonal-collections'), 'Winter Elegance', 'winter-elegance', 'Sophisticated winter arrangements with classic white and deep colors', true, 4),

-- Special Occasions subcategories
((SELECT id FROM categories WHERE slug = 'special-occasions'), 'Wedding Bouquets', 'wedding-bouquets', 'Exquisite bridal and wedding party bouquets handcrafted for your special day', true, 1),
((SELECT id FROM categories WHERE slug = 'special-occasions'), 'Anniversary Arrangements', 'anniversary-arrangements', 'Romantic bouquets celebrating love and milestones in relationships', true, 2),
((SELECT id FROM categories WHERE slug = 'special-occasions'), 'Birthday Surprises', 'birthday-surprises', 'Joyful birthday bouquets to make celebrations extra special', true, 3),
((SELECT id FROM categories WHERE slug = 'special-occasions'), 'Sympathy & Condolence', 'sympathy-condolence', 'Respectful and comforting arrangements for times of remembrance', true, 4);

-- Insert Sample Products (Handmade Bouquets by Ramana)
INSERT INTO products (
  title, 
  description, 
  price, 
  discount_price, 
  cover_image, 
  gallery_images, 
  rating, 
  category_id, 
  subcategory_id, 
  stock, 
  is_featured, 
  is_handmade, 
  materials, 
  care_instructions, 
  size_info
) VALUES

-- Rose Bouquets
(
  'Classic Red Rose Bouquet - Hand Made by Ramana',
  'A timeless arrangement of 12 premium red roses, carefully selected and handcrafted by Ramana. Each rose is hand-picked for its perfect bloom and arranged with delicate baby''s breath and elegant wrapping. Perfect for expressing deep love and passion.',
  2500.00,
  2200.00,
  '/images/bouquets/red-roses-classic.jpg',
  '[""/images/bouquets/red-roses-classic-1.jpg"", ""/images/bouquets/red-roses-classic-2.jpg"", ""/images/bouquets/red-roses-classic-3.jpg""]'::jsonb,
  4.9,
  (SELECT id FROM categories WHERE slug = 'handmade-bouquets'),
  (SELECT id FROM subcategories WHERE slug = 'rose-bouquets'),
  15,
  true,
  true,
  ARRAY['Premium Red Roses', 'Baby''s Breath', 'Eucalyptus Leaves', 'Satin Ribbon', 'Decorative Paper'],
  'Keep in cool water, trim stems every 2-3 days, avoid direct sunlight. Change water daily for longer freshness.',
  'Height: 45cm, Width: 30cm - Perfect size for gifting'
),

(
  'Pink Rose Garden Bouquet - Handcrafted with Love',
  'Soft pink roses combined with white lilies, handcrafted by Ramana to create a gentle and romantic arrangement. Features 10 pink roses with complementary flowers and greenery, wrapped in elegant pink paper.',
  2200.00,
  1950.00,
  '/images/bouquets/pink-roses-garden.jpg',
  '[""/images/bouquets/pink-roses-garden-1.jpg"", ""/images/bouquets/pink-roses-garden-2.jpg""]'::jsonb,
  4.8,
  (SELECT id FROM categories WHERE slug = 'handmade-bouquets'),
  (SELECT id FROM subcategories WHERE slug = 'rose-bouquets'),
  12,
  true,
  true,
  ARRAY['Pink Roses', 'White Lilies', 'Green Foliage', 'Pink Wrapping Paper', 'Satin Bow'],
  'Place in fresh water immediately, keep away from heat sources, mist lightly daily.',
  'Height: 40cm, Width: 28cm - Elegant medium size'
),

-- Mixed Flower Bouquets
(
  'Ramana''s Rainbow Mix - Handmade Floral Symphony',
  'A vibrant celebration of colors featuring roses, gerberas, carnations, and seasonal flowers. Each bouquet is uniquely arranged by Ramana, ensuring no two are exactly alike. A perfect representation of joy and happiness.',
  2800.00,
  2500.00,
  '/images/bouquets/rainbow-mix.jpg',
  '[""/images/bouquets/rainbow-mix-1.jpg"", ""/images/bouquets/rainbow-mix-2.jpg"", ""/images/bouquets/rainbow-mix-3.jpg""]'::jsonb,
  5.0,
  (SELECT id FROM categories WHERE slug = 'handmade-bouquets'),
  (SELECT id FROM subcategories WHERE slug = 'mixed-flower-bouquets'),
  8,
  true,
  true,
  ARRAY['Mixed Roses', 'Gerbera Daisies', 'Carnations', 'Alstroemeria', 'Seasonal Greens', 'Colorful Wrapping'],
  'Trim stems at an angle, use flower food if provided, remove wilted flowers to extend life of others.',
  'Height: 50cm, Width: 35cm - Large impressive arrangement'
),

(
  'Pastel Dreams Bouquet - Hand Made by Ramana',
  'Soft pastel colors create a dreamy arrangement perfect for gentle celebrations. Features cream roses, light pink carnations, and white chrysanthemums, handcrafted with Ramana''s signature touch.',
  2300.00,
  2100.00,
  '/images/bouquets/pastel-dreams.jpg',
  '[""/images/bouquets/pastel-dreams-1.jpg"", ""/images/bouquets/pastel-dreams-2.jpg""]'::jsonb,
  4.7,
  (SELECT id FROM categories WHERE slug = 'handmade-bouquets'),
  (SELECT id FROM subcategories WHERE slug = 'mixed-flower-bouquets'),
  10,
  false,
  true,
  ARRAY['Cream Roses', 'Pink Carnations', 'White Chrysanthemums', 'Soft Greenery', 'Pastel Wrapping'],
  'Keep in cool environment, change water every 2 days, trim stems regularly.',
  'Height: 42cm, Width: 30cm - Medium elegant size'
),

-- Lily Arrangements
(
  'Pure White Lily Elegance - Ramana''s Signature',
  'Sophisticated white lilies arranged with minimal greenery to showcase their natural beauty. Handcrafted by Ramana for those who appreciate understated elegance and purity.',
  2600.00,
  2400.00,
  '/images/bouquets/white-lily-elegance.jpg',
  '[""/images/bouquets/white-lily-elegance-1.jpg"", ""/images/bouquets/white-lily-elegance-2.jpg""]'::jsonb,
  4.9,
  (SELECT id FROM categories WHERE slug = 'handmade-bouquets'),
  (SELECT id FROM subcategories WHERE slug = 'lily-arrangements'),
  6,
  true,
  true,
  ARRAY['White Lilies', 'Eucalyptus', 'White Roses', 'Elegant White Wrapping', 'Silver Ribbon'],
  'Remove pollen from stamens to prevent staining, keep in fresh water, avoid strong fragrances nearby.',
  'Height: 48cm, Width: 32cm - Tall elegant arrangement'
),

-- Wedding Bouquets
(
  'Bridal Bliss - Ramana''s Wedding Special',
  'A stunning bridal bouquet featuring white roses, baby''s breath, and delicate greenery. Handcrafted by Ramana specifically for your special day, with attention to every detail that makes your wedding memorable.',
  4500.00,
  4200.00,
  '/images/bouquets/bridal-bliss.jpg',
  '[""/images/bouquets/bridal-bliss-1.jpg"", ""/images/bouquets/bridal-bliss-2.jpg"", ""/images/bouquets/bridal-bliss-3.jpg""]'::jsonb,
  5.0,
  (SELECT id FROM categories WHERE slug = 'special-occasions'),
  (SELECT id FROM subcategories WHERE slug = 'wedding-bouquets'),
  3,
  true,
  true,
  ARRAY['Premium White Roses', 'Baby''s Breath', 'Eucalyptus', 'Pearl Pins', 'Satin Handle Wrap', 'Lace Details'],
  'Keep refrigerated until ceremony, mist lightly, handle with care to preserve shape.',
  'Height: 35cm, Width: 25cm - Perfect bridal size with comfortable handle'
),

-- Birthday Surprises
(
  'Happy Birthday Sunshine - Hand Made by Ramana',
  'Bright and cheerful arrangement featuring yellow roses, orange gerberas, and colorful accents. Designed by Ramana to bring sunshine and joy to birthday celebrations.',
  2400.00,
  2150.00,
  '/images/bouquets/birthday-sunshine.jpg',
  '[""/images/bouquets/birthday-sunshine-1.jpg"", ""/images/bouquets/birthday-sunshine-2.jpg""]'::jsonb,
  4.8,
  (SELECT id FROM categories WHERE slug = 'special-occasions'),
  (SELECT id FROM subcategories WHERE slug = 'birthday-surprises'),
  12,
  false,
  true,
  ARRAY['Yellow Roses', 'Orange Gerberas', 'Colorful Carnations', 'Festive Wrapping', 'Birthday Ribbon'],
  'Display in bright location away from direct sun, change water regularly, enjoy the vibrant colors.',
  'Height: 45cm, Width: 32cm - Cheerful celebration size'
),

-- Spring Blooms
(
  'Spring Awakening - Ramana''s Seasonal Special',
  'Fresh spring flowers including tulips, daffodils, and cherry blossoms, handcrafted to celebrate the renewal of nature. A limited seasonal collection by Ramana.',
  2700.00,
  2450.00,
  '/images/bouquets/spring-awakening.jpg',
  '[""/images/bouquets/spring-awakening-1.jpg"", ""/images/bouquets/spring-awakening-2.jpg""]'::jsonb,
  4.9,
  (SELECT id FROM categories WHERE slug = 'seasonal-collections'),
  (SELECT id FROM subcategories WHERE slug = 'spring-blooms'),
  5,
  true,
  true,
  ARRAY['Tulips', 'Daffodils', 'Cherry Blossoms', 'Spring Greens', 'Natural Burlap Wrap'],
  'Keep cool, these delicate spring flowers prefer cooler temperatures and gentle handling.',
  'Height: 40cm, Width: 30cm - Fresh spring arrangement'
),

-- Anniversary Arrangements
(
  'Golden Anniversary Love - Handcrafted by Ramana',
  'Luxurious arrangement featuring golden roses and champagne-colored flowers, perfect for celebrating milestone anniversaries. Each bouquet is personally crafted by Ramana with extra care.',
  3200.00,
  2900.00,
  '/images/bouquets/golden-anniversary.jpg',
  '[""/images/bouquets/golden-anniversary-1.jpg"", ""/images/bouquets/golden-anniversary-2.jpg""]'::jsonb,
  5.0,
  (SELECT id FROM categories WHERE slug = 'special-occasions'),
  (SELECT id FROM subcategories WHERE slug = 'anniversary-arrangements'),
  4,
  true,
  true,
  ARRAY['Golden Roses', 'Champagne Carnations', 'Gold Accents', 'Luxury Wrapping', 'Golden Ribbon'],
  'Handle with extra care, keep in moderate temperature, perfect for special photography.',
  'Height: 50cm, Width: 35cm - Luxurious anniversary size'
);

-- Update the metadata to reflect the business information
COMMENT ON TABLE categories IS 'Handmade bouquet categories for Ramana''s flower business - Contact: 98192747199, ramanatheeng65@gmail.com';
COMMENT ON TABLE subcategories IS 'Subcategories for handmade bouquets by Ramana - Serving Kathmandu Valley, Nepal';
COMMENT ON TABLE products IS 'Handcrafted bouquet products by Ramana - Each piece made with love and care in Kathmandu, Nepal';