import { Category, Product } from "../types/product";

export const categories: Category[] = [
  {
    id: 1,
    name: "Wedding Bouquets",
    slug: "wedding-bouquets",
    description: "Elegant and romantic bouquets perfect for your special day",
    image:
      "https://images.unsplash.com/photo-1606041008023-472dfb5e530f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    productCount: 8,
  },
  {
    id: 2,
    name: "Birthday Flowers",
    slug: "birthday-flowers",
    description: "Bright and cheerful arrangements to celebrate life's moments",
    image:
      "https://images.unsplash.com/photo-1574684891174-df6b02ab38d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    productCount: 6,
  },
  {
    id: 3,
    name: "Romantic Roses",
    slug: "romantic-roses",
    description: "Classic roses for expressing love and affection",
    image:
      "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    productCount: 5,
  },
  {
    id: 4,
    name: "Seasonal Arrangements",
    slug: "seasonal-arrangements",
    description: "Beautiful seasonal flowers that capture nature's beauty",
    image:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    productCount: 4,
  },
  {
    id: 5,
    name: "Corporate Gifts",
    slug: "corporate-gifts",
    description: "Professional arrangements for business occasions",
    image:
      "https://images.unsplash.com/photo-1487070183336-b863922373d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    productCount: 3,
  },
];

export const products: Product[] = [
  {
    id: 1,
    name: "Classic Red Roses Bridal Bouquet",
    slug: "classic-red-roses-bridal-bouquet",
    description:
      "An elegant handcrafted bouquet featuring premium red roses, perfect for romantic occasions and weddings. Each rose is carefully selected and arranged with delicate baby's breath and lush greenery to create a timeless and sophisticated look.",
    shortDescription:
      "Elegant handcrafted bouquet of premium red roses, perfect for romantic occasions.",
    price: 4500,
    discountPrice: 4200,
    images: [
      "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1606041008023-472dfb5e530f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
    mainImage:
      "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: categories[0], // Wedding Bouquets
    tags: ["roses", "red", "wedding", "romantic", "premium"],
    inStock: true,
    stockQuantity: 15,
    rating: 4.9,
    reviewCount: 24,
    features: [
      "Hand-selected premium red roses",
      "Complemented with baby's breath",
      "Fresh eucalyptus greenery",
      "Elegant satin ribbon wrap",
      "Same-day delivery available",
    ],
    dimensions: "30cm height x 25cm width",
    weight: "800g",
    careInstructions:
      "Keep in cool water, trim stems daily, avoid direct sunlight",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-20T15:30:00Z",
  },
  {
    id: 2,
    name: "Garden Pink Roses Arrangement",
    slug: "garden-pink-roses-arrangement",
    description:
      "Beautiful pink roses arranged with delicate greenery for a soft, romantic touch. This charming bouquet combines various shades of pink roses with seasonal foliage to create a garden-fresh appearance.",
    shortDescription:
      "Beautiful pink roses arranged with delicate greenery for a soft, romantic touch.",
    price: 3200,
    discountPrice: 2950,
    images: [
      "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1487070183336-b863922373d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
    mainImage:
      "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: categories[2], // Romantic Roses
    tags: ["roses", "pink", "garden", "romantic", "soft"],
    inStock: true,
    stockQuantity: 12,
    rating: 4.8,
    reviewCount: 18,
    features: [
      "Multiple shades of pink roses",
      "Garden-style arrangement",
      "Seasonal foliage included",
      "Rustic burlap wrap",
      "Perfect for anniversaries",
    ],
    dimensions: "28cm height x 22cm width",
    weight: "650g",
    careInstructions: "Change water every 2 days, keep in cool location",
    createdAt: "2024-01-10T09:00:00Z",
    updatedAt: "2024-01-18T14:20:00Z",
  },
  {
    id: 3,
    name: "Rainbow Mix Celebration Bouquet",
    slug: "rainbow-mix-celebration-bouquet",
    description:
      "Vibrant mixed flower bouquet with roses, lilies, and seasonal blooms. This joyful arrangement features a rainbow of colors including bright yellows, oranges, pinks, and purples to celebrate life's special moments.",
    shortDescription:
      "Vibrant mixed flower bouquet with roses, lilies, and seasonal blooms.",
    price: 3800,
    discountPrice: 3500,
    images: [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1574684891174-df6b02ab38d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
    mainImage:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: categories[1], // Birthday Flowers
    tags: ["mixed", "colorful", "birthday", "celebration", "vibrant"],
    inStock: true,
    stockQuantity: 8,
    rating: 5.0,
    reviewCount: 32,
    features: [
      "Rainbow of vibrant colors",
      "Mix of roses and lilies",
      "Seasonal accent flowers",
      "Cheerful presentation",
      "Perfect for celebrations",
    ],
    dimensions: "35cm height x 30cm width",
    weight: "900g",
    careInstructions:
      "Trim stems at angle, use flower food, replace water regularly",
    createdAt: "2024-01-08T11:30:00Z",
    updatedAt: "2024-01-22T16:45:00Z",
  },
  {
    id: 4,
    name: "Pastel Dreams Wedding Collection",
    slug: "pastel-dreams-wedding-collection",
    description:
      "Soft pastel colored flowers creating a dreamy, elegant arrangement. This sophisticated bouquet features gentle hues of lavender, peach, and cream flowers for a romantic and ethereal wedding look.",
    shortDescription:
      "Soft pastel colored flowers creating a dreamy, elegant arrangement.",
    price: 4200,
    discountPrice: 3900,
    images: [
      "https://images.unsplash.com/photo-1487070183336-b863922373d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1606041008023-472dfb5e530f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
    mainImage:
      "https://images.unsplash.com/photo-1487070183336-b863922373d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: categories[0], // Wedding Bouquets
    tags: ["pastel", "wedding", "dreamy", "elegant", "soft"],
    inStock: true,
    stockQuantity: 6,
    rating: 4.7,
    reviewCount: 15,
    features: [
      "Soft pastel color palette",
      "Lavender and peach tones",
      "Cream accent flowers",
      "Delicate silk ribbon",
      "Bridal collection piece",
    ],
    dimensions: "32cm height x 26cm width",
    weight: "750g",
    careInstructions: "Handle gently, keep cool, mist lightly daily",
    createdAt: "2024-01-12T13:15:00Z",
    updatedAt: "2024-01-19T10:30:00Z",
  },
  {
    id: 5,
    name: "White Lily Elegance Arrangement",
    slug: "white-lily-elegance-arrangement",
    description:
      "Sophisticated white lilies with complementary flowers for special occasions. This refined arrangement showcases the natural beauty of white lilies paired with elegant greenery and accent flowers.",
    shortDescription:
      "Sophisticated white lilies with complementary flowers for special occasions.",
    price: 3600,
    discountPrice: 3400,
    images: [
      "https://images.unsplash.com/photo-1490750967868-88aa4486c946?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1487070183336-b863922373d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
    mainImage:
      "https://images.unsplash.com/photo-1490750967868-88aa4486c946?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: categories[4], // Corporate Gifts
    tags: ["lily", "white", "elegant", "sophisticated", "corporate"],
    inStock: true,
    stockQuantity: 10,
    rating: 4.9,
    reviewCount: 21,
    features: [
      "Premium white lilies",
      "Sophisticated design",
      "Professional presentation",
      "Long-lasting flowers",
      "Corporate gift ready",
    ],
    dimensions: "40cm height x 25cm width",
    weight: "1000g",
    careInstructions: "Remove pollen carefully, change water frequently",
    createdAt: "2024-01-05T08:45:00Z",
    updatedAt: "2024-01-21T12:15:00Z",
  },
  {
    id: 6,
    name: "Luxury Bridal Bliss Collection",
    slug: "luxury-bridal-bliss-collection",
    description:
      "Luxurious bridal bouquet with premium white and cream flowers. This exquisite arrangement features the finest white roses, peonies, and orchids, creating the perfect centerpiece for your wedding day.",
    shortDescription:
      "Luxurious bridal bouquet with premium white and cream flowers.",
    price: 6500,
    discountPrice: 6200,
    images: [
      "https://images.unsplash.com/photo-1606041008023-472dfb5e530f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
    mainImage:
      "https://images.unsplash.com/photo-1606041008023-472dfb5e530f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: categories[0], // Wedding Bouquets
    tags: ["luxury", "bridal", "white", "premium", "wedding"],
    inStock: true,
    stockQuantity: 4,
    rating: 5.0,
    reviewCount: 12,
    features: [
      "Premium white roses",
      "Exotic orchids included",
      "Luxury presentation box",
      "Pearl accents",
      "Bridal collection exclusive",
    ],
    dimensions: "45cm height x 35cm width",
    weight: "1200g",
    careInstructions: "Handle with extreme care, professional arrangement",
    createdAt: "2024-01-03T14:20:00Z",
    updatedAt: "2024-01-20T09:10:00Z",
  },
  {
    id: 7,
    name: "Birthday Sunshine Celebration",
    slug: "birthday-sunshine-celebration",
    description:
      "Bright and cheerful yellow and orange flowers perfect for celebrations. This vibrant arrangement brings joy and warmth to any birthday celebration with sunflowers, marigolds, and orange roses.",
    shortDescription:
      "Bright and cheerful yellow and orange flowers perfect for celebrations.",
    price: 2800,
    discountPrice: 2550,
    images: [
      "https://images.unsplash.com/photo-1574684891174-df6b02ab38d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
    mainImage:
      "https://images.unsplash.com/photo-1574684891174-df6b02ab38d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: categories[1], // Birthday Flowers
    tags: ["birthday", "yellow", "orange", "cheerful", "sunflower"],
    inStock: true,
    stockQuantity: 14,
    rating: 4.6,
    reviewCount: 28,
    features: [
      "Bright sunflowers",
      "Orange roses accent",
      "Cheerful marigolds",
      "Festive ribbon wrap",
      "Birthday card included",
    ],
    dimensions: "30cm height x 28cm width",
    weight: "700g",
    careInstructions: "Keep in bright location, water daily",
    createdAt: "2024-01-07T16:30:00Z",
    updatedAt: "2024-01-18T11:45:00Z",
  },
  {
    id: 8,
    name: "Seasonal Wildflower Meadow",
    slug: "seasonal-wildflower-meadow",
    description:
      "Natural wildflower arrangement with seasonal blooms and rustic charm. This organic-style bouquet captures the beauty of a meadow with native flowers and natural greenery.",
    shortDescription:
      "Natural wildflower arrangement with seasonal blooms and rustic charm.",
    price: 2400,
    discountPrice: 2150,
    images: [
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1487070183336-b863922373d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
    mainImage:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: categories[3], // Seasonal Arrangements
    tags: ["wildflower", "seasonal", "natural", "rustic", "meadow"],
    inStock: true,
    stockQuantity: 9,
    rating: 4.5,
    reviewCount: 16,
    features: [
      "Native wildflowers",
      "Seasonal availability",
      "Rustic presentation",
      "Natural twine wrap",
      "Eco-friendly choice",
    ],
    dimensions: "25cm height x 20cm width",
    weight: "500g",
    careInstructions: "Natural arrangement, minimal care needed",
    createdAt: "2024-01-09T12:00:00Z",
    updatedAt: "2024-01-17T15:20:00Z",
  },
];

// Helper functions
export const getProductsByCategory = (categorySlug: string): Product[] => {
  return products.filter((product) => product.category.slug === categorySlug);
};

export const getProductBySlug = (slug: string): Product | undefined => {
  return products.find((product) => product.slug === slug);
};

export const getSimilarProducts = (
  product: Product,
  limit: number = 4
): Product[] => {
  return products
    .filter((p) => p.id !== product.id && p.category.id === product.category.id)
    .slice(0, limit);
};

export const searchProducts = (query: string): Product[] => {
  const lowercaseQuery = query.toLowerCase();
  return products.filter(
    (product) =>
      product.name.toLowerCase().includes(lowercaseQuery) ||
      product.description.toLowerCase().includes(lowercaseQuery) ||
      product.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery))
  );
};
